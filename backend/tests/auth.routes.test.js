/**
 * Testes automatizados das rotas de autenticação do UniRef.
 *
 * Rodam sem conectar ao Firebase real ou ao MySQL:
 * - o Firebase Admin é simulado;
 * - o repository é substituído por uma coleção em memória;
 * - o Express, o middleware, as routes, o controller e o service são reais.
 *
 * O domínio de teste é apenas uma configuração isolada do processo Jest.
 * Ajuste-o quando a equipe decidir o domínio institucional final.
 */
import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import request from 'supertest';

process.env.ALLOWED_EMAIL_DOMAIN = '@edu.unifor.br';

const usuarios = new Map();
let proximoId = 1;

const verifyIdTokenMock = jest.fn();
const findByFirebaseUidMock = jest.fn();
const createUserMock = jest.fn();
const updateUserMock = jest.fn();

// Jest precisa registrar os mocks antes de importar o Express (ES Modules).
jest.unstable_mockModule('../src/config/firebase.js', () => ({
  firebaseAuth: { verifyIdToken: verifyIdTokenMock },
}));

jest.unstable_mockModule('../src/modules/users/users.repository.js', () => ({
  findByFirebaseUid: findByFirebaseUidMock,
  createUser: createUserMock,
  updateUser: updateUserMock,
}));

const { default: app } = await import('../src/app.js');

const usuarioFirebase = {
  uid: 'uid-aluno-001',
  email: 'aluno@edu.unifor.br',
  name: 'Aluno de Teste',
  email_verified: true,
};

const autenticado = (metodo, caminho) =>
  request(app)[metodo](caminho).set('Authorization', 'Bearer token-valido');

beforeEach(() => {
  usuarios.clear();
  proximoId = 1;
  jest.clearAllMocks();

  verifyIdTokenMock.mockImplementation(async (token) => {
    if (token !== 'token-valido') throw new Error('Token invalido');
    return { ...usuarioFirebase };
  });

  findByFirebaseUidMock.mockImplementation(async (uid) => usuarios.get(uid) ?? null);

  createUserMock.mockImplementation(async (data) => {
    const novoUsuario = {
      id: `00000000-0000-4000-8000-${String(proximoId++).padStart(12, '0')}`,
      ...data,
    };
    usuarios.set(novoUsuario.firebaseUid, novoUsuario);
    return novoUsuario;
  });

  updateUserMock.mockImplementation(async (usuario, data) => {
    const atualizado = { ...usuario, ...data };
    usuarios.set(atualizado.firebaseUid, atualizado);
    return atualizado;
  });
});

describe('GET /api/v1/health', () => {
  test('retorna 200 e status ok', async () => {
    const resposta = await request(app).get('/api/v1/health');

    expect(resposta.status).toBe(200);
    expect(resposta.body).toEqual({ data: { status: 'ok' } });
  });
});

describe('POST /api/v1/auth/sync', () => {
  test('retorna 401 quando nao ha token', async () => {
    const resposta = await request(app).post('/api/v1/auth/sync');

    expect(resposta.status).toBe(401);
    expect(resposta.body.error.code).toBe('UNAUTHENTICATED');
    expect(verifyIdTokenMock).not.toHaveBeenCalled();
    expect(createUserMock).not.toHaveBeenCalled();
  });

  test('retorna 401 quando Authorization nao usa Bearer', async () => {
    const resposta = await request(app)
      .post('/api/v1/auth/sync')
      .set('Authorization', 'Basic token-valido');

    expect(resposta.status).toBe(401);
    expect(verifyIdTokenMock).not.toHaveBeenCalled();
  });

  test('retorna 401 para token invalido', async () => {
    const resposta = await request(app)
      .post('/api/v1/auth/sync')
      .set('Authorization', 'Bearer token-invalido');

    expect(resposta.status).toBe(401);
    expect(resposta.body.error.code).toBe('UNAUTHENTICATED');
    expect(createUserMock).not.toHaveBeenCalled();
  });

  test('retorna 403 para email fora do dominio', async () => {
    verifyIdTokenMock.mockResolvedValueOnce({
      ...usuarioFirebase,
      email: 'aluno@gmail.com',
    });

    const resposta = await autenticado('post', '/api/v1/auth/sync');

    expect(resposta.status).toBe(403);
    expect(resposta.body.error.code).toBe('DOMAIN_NOT_ALLOWED');
    expect(createUserMock).not.toHaveBeenCalled();
    expect(updateUserMock).not.toHaveBeenCalled();
  });

  test('retorna 403 se o email nao foi verificado', async () => {
    verifyIdTokenMock.mockResolvedValueOnce({
      ...usuarioFirebase,
      email_verified: false,
    });

    const resposta = await autenticado('post', '/api/v1/auth/sync');

    expect(resposta.status).toBe(403);
    expect(resposta.body.error.code).toBe('EMAIL_NOT_VERIFIED');
    expect(createUserMock).not.toHaveBeenCalled();
  });

  test('cria o usuario no primeiro acesso', async () => {
    const resposta = await autenticado('post', '/api/v1/auth/sync');

    expect(resposta.status).toBe(200);
    expect(resposta.body.data).toEqual(expect.objectContaining({
      id: expect.any(String),
      firebaseUid: usuarioFirebase.uid,
      name: usuarioFirebase.name,
      email: usuarioFirebase.email,
      emailVerified: true,
    }));
    expect(createUserMock).toHaveBeenCalledWith(expect.objectContaining({
      firebaseUid: usuarioFirebase.uid,
      email: usuarioFirebase.email,
    }));
    expect(usuarios.size).toBe(1);
    expect(verifyIdTokenMock).toHaveBeenCalledWith('token-valido', true);
  });

  test('sincronizar duas vezes atualiza sem duplicar', async () => {
    const primeira = await autenticado('post', '/api/v1/auth/sync');
    const segunda = await autenticado('post', '/api/v1/auth/sync');

    expect(primeira.status).toBe(200);
    expect(segunda.status).toBe(200);
    expect(segunda.body.data.id).toBe(primeira.body.data.id);
    expect(createUserMock).toHaveBeenCalledTimes(1);
    expect(updateUserMock).toHaveBeenCalledTimes(1);
    expect(usuarios.size).toBe(1);
  });

  test('retorna 409 em conflito de email unico', async () => {
    const erro = new Error('Registro duplicado');
    erro.name = 'SequelizeUniqueConstraintError';
    createUserMock.mockRejectedValueOnce(erro);

    const resposta = await autenticado('post', '/api/v1/auth/sync');

    expect(resposta.status).toBe(409);
    expect(resposta.body.error.code).toBe('EMAIL_CONFLICT');
  });

  test('retorna 500 sem expor detalhes do banco', async () => {
    findByFirebaseUidMock.mockRejectedValueOnce(new Error('senha secreta do DB'));
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    try {
      const resposta = await autenticado('post', '/api/v1/auth/sync');

      expect(resposta.status).toBe(500);
      expect(resposta.body.error.code).toBe('INTERNAL');
      expect(JSON.stringify(resposta.body)).not.toContain('senha secreta');
    } finally {
      consoleError.mockRestore();
    }
  });
});

describe('GET /api/v1/auth/me', () => {
  test('retorna 401 sem token', async () => {
    const resposta = await request(app).get('/api/v1/auth/me');

    expect(resposta.status).toBe(401);
    expect(resposta.body.error.code).toBe('UNAUTHENTICATED');
  });

  test('retorna 404 se o usuario ainda nao foi sincronizado', async () => {
    const resposta = await autenticado('get', '/api/v1/auth/me');

    expect(resposta.status).toBe(404);
    expect(resposta.body.error.code).toBe('USER_NOT_FOUND');
  });

  test('retorna 200 e dados do perfil cadastrado', async () => {
    await autenticado('post', '/api/v1/auth/sync');

    const resposta = await autenticado('get', '/api/v1/auth/me');

    expect(resposta.status).toBe(200);
    expect(resposta.body.data).toEqual(expect.objectContaining({
      firebaseUid: usuarioFirebase.uid,
      email: usuarioFirebase.email,
      name: usuarioFirebase.name,
      emailVerified: true,
    }));
    expect(resposta.body.data).not.toHaveProperty('password');
    expect(createUserMock).toHaveBeenCalledTimes(1);
  });

  test('retorna 403 se o email nao estiver verificado', async () => {
    verifyIdTokenMock.mockResolvedValueOnce({
      ...usuarioFirebase,
      email_verified: false,
    });

    const resposta = await autenticado('get', '/api/v1/auth/me');

    expect(resposta.status).toBe(403);
    expect(resposta.body.error.code).toBe('EMAIL_NOT_VERIFIED');
  });

  test('retorna 403 para email nao institucional', async () => {
    verifyIdTokenMock.mockResolvedValueOnce({
      ...usuarioFirebase,
      email: 'aluno@gmail.com',
    });

    const resposta = await autenticado('get', '/api/v1/auth/me');

    expect(resposta.status).toBe(403);
    expect(resposta.body.error.code).toBe('DOMAIN_NOT_ALLOWED');
  });
});
