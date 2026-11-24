import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import request from 'supertest';
import express from 'express';

import { randomUUID } from 'node:crypto';

process.env.ALLOWED_EMAIL_DOMAINS = '@edu.unifor.br,@unifor.br';

const registros = new Map();
const usuarios = { a: randomUUID(), b: randomUUID() };

const verifyIdToken = jest.fn(async token => {
  if (!usuarios[token] && token !== 'externo') {
    throw new Error('Token inválido');
  }

  return {
    uid: token,
    email: token === 'externo'
      ? 'teste@example.com'
      : `${token}@edu.unifor.br`,
    email_verified: true
  };
});

jest.unstable_mockModule('../src/config/firebase.js', () => ({
  firebaseAuth: { verifyIdToken }
}));

jest.unstable_mockModule('../src/modules/users/users.repository.js', () => ({
  findByFirebaseUid: async uid => usuarios[uid]
    ? { id: usuarios[uid] }
    : null,

  createUser: jest.fn(),
  updateUser: jest.fn()
}));

const dono = (uid, id) => {
  const ref = registros.get(id);
  return ref?.usuarioId === uid ? ref : null;
};

const repository = {
  findByIdempotencyKey: jest.fn(async (uid, key) =>
    [...registros.values()].find(
      r => r.usuarioId === uid && r.idempotencyKey === key
    ) ?? null
  ),

  createReferenceWithAuthors: jest.fn(async (dados, autores) => {
    const ref = {
      ...dados,
      id: randomUUID(),
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      autores: autores.map((a, i) => ({
        ...a,
        posicao: i + 1
      }))
    };

    registros.set(ref.id, ref);

    return ref;
  }),

  listReferences: jest.fn(async (uid, { type, q, offset, limit }) => {
    const rows = [...registros.values()].filter(
      r => r.usuarioId === uid &&
        (!type || r.tipo === type) &&
        (!q || r.titulo.includes(q))
    );

    return {
      rows: rows.slice(offset, offset + limit),
      count: rows.length
    };
  }),

  findReferenceById: jest.fn(async (uid, id) => dono(uid, id)),

  updateReferenceWithAuthors: jest.fn(
    async (uid, id, version, dados, autores) => {
      const ref = dono(uid, id);

      if (!ref) return { status: 404 };

      if (ref.version !== version) {
        return { status: 409 };
      }

      Object.assign(ref, dados, {
        version: version + 1,
        autores: autores.map((a, i) => ({
          ...a,
          posicao: i + 1
        }))
      });

      return { status: 200, ref };
    }
  ),

  deleteReference: jest.fn(async (uid, id) =>
    dono(uid, id) && registros.delete(id) ? 1 : 0
  )
};

jest.unstable_mockModule(
  '../src/modules/references/references.repository.js',
  () => repository
);

const { default: referencesRoutes } = await import(
  '../src/modules/references/routes.js'
);

beforeEach(() => {
  registros.clear();
  jest.clearAllMocks();
});

// Criar uma aplicação Express somente para os testes
const app = express();

app.use(express.json());
app.use('/api/v1/references', referencesRoutes);

// Dados de um livro válido
const livroValido = {
  tipo: 'livro',
  autoria: 'conhecida',
  quantidadeAutores: 2,
  responsabilidade: 'Autor da Obra',
  abreviacao: false,
  autores: [
    { tipo: 'pessoa', nome: 'Ana Silva' },
    { tipo: 'pessoa', nome: 'Bruno Costa' }
  ],
  titulo: 'Introdução à pesquisa',
  subtitulo: null,
  outraResponsabilidade: null,
  serie: null,
  edicao: '2',
  localPublicacao: 'Fortaleza',
  editora: 'Editora Exemplo',
  anoPublicacao: '2025',
  notas: null,
  online: false,
  url: null,
  dataAcesso: null
};

describe('POST /api/v1/references/preview', () => {

  test('retorna 200 para um livro válido', async () => {
    const resposta = await request(app)
      .post('/api/v1/references/preview')
      .send(livroValido);

    expect(resposta.status).toBe(200);

    expect(resposta.body.data.textoPuro)
      .toContain('SILVA, Ana; COSTA, Bruno.');

    expect(resposta.body.data.segmentos)
      .toBeInstanceOf(Array);
  });

  test('retorna 422 quando o título não é informado', async () => {
    const { titulo, ...livroSemTitulo } = livroValido;

    const resposta = await request(app)
      .post('/api/v1/references/preview')
      .send(livroSemTitulo);

    expect(resposta.status).toBe(422);

    expect(resposta.body.error.code)
      .toBe('VALIDATION_ERROR');

    expect(resposta.body.error.fields)
      .toEqual(
        expect.arrayContaining([
          expect.objectContaining({ path: 'titulo' })
        ])
      );
  });

  test('retorna 422 para um tipo não suportado', async () => {
    const resposta = await request(app)
      .post('/api/v1/references/preview')
      .send({ ...livroValido, tipo: 'artigo' });

    expect(resposta.status).toBe(422);

    expect(resposta.body.error.code)
      .toBe('VALIDATION_ERROR');
  });

});

const base = '/api/v1/references';

const auth = (method, path = '', token = 'a') =>
  request(app)[method](base + path)
    .set('Authorization', `Bearer ${token}`);

const salvar = (
  key = randomUUID(),
  documento = livroValido,
  token = 'a'
) =>
  auth('post', '', token)
    .set('Idempotency-Key', key)
    .send(documento);

describe('CRUD de referências (repository e Firebase simulados)', () => {

  test('prévia não grava nem autentica', async () => {
    expect(
      (await request(app)
        .post(base + '/preview')
        .send(livroValido)).status
    ).toBe(200);

    expect(repository.createReferenceWithAuthors)
      .not.toHaveBeenCalled();

    expect(verifyIdToken).not.toHaveBeenCalled();
  });

  test('protege todas as rotas e bloqueia domínio externo', async () => {
    const id = '/' + randomUUID();

    for (const [method, path] of [
      ['post', ''],
      ['get', ''],
      ['get', id],
      ['put', id],
      ['delete', id]
    ]) {
      expect(
        (await request(app)[method](base + path)).status
      ).toBe(401);
    }

    expect(
      (await auth('get', '', 'externo')).status
    ).toBe(403);

    expect(
      (await auth('get', '', 'invalido')).status
    ).toBe(401);
  });

  test('salva, repete chave sem duplicar e rejeita conteúdo diferente', async () => {
    const key = randomUUID();

    const primeira = await salvar(key);

    expect(primeira.status).toBe(201);

    expect(primeira.body.data.version).toBe(1);

    expect(primeira.body.data)
      .not.toHaveProperty('requestHash');

    expect(primeira.body.data)
      .not.toHaveProperty('usuarioId');

    const segunda = await salvar(key);

    expect(segunda.status).toBe(200);

    expect(segunda.body.data)
      .toEqual(primeira.body.data);

    expect(
      (await salvar(key, {
        ...livroValido,
        titulo: 'Outro'
      })).status
    ).toBe(409);

    expect(repository.createReferenceWithAuthors)
      .toHaveBeenCalledTimes(1);

    expect(
      (await salvar(key, livroValido, 'b')).status
    ).toBe(201);

    const ref = [...registros.values()][0];

    expect(ref.metadata).not.toHaveProperty('titulo');

    expect(ref.metadata).not.toHaveProperty('autores');
  });

  test('valida header, corpo e filtros', async () => {
    expect(
      (await salvar('invalido')).status
    ).toBe(422);

    expect(
      (await salvar(randomUUID(), {
        ...livroValido,
        userId: usuarios.b
      })).status
    ).toBe(422);

    expect(
      (await salvar(randomUUID(), {
        ...livroValido,
        textoPuro: 'forjado'
      })).status
    ).toBe(422);

    for (const q of [
      '?page=0',
      '?pageSize=101',
      '?type=outro',
      '?userId=x',
      '?page=1&page=2'
    ]) {
      expect(
        (await auth('get', q)).status
      ).toBe(422);
    }
  });

  test('lista apenas próprias, busca por título, consulta dados originais', async () => {
    const { body } = await salvar();

    await salvar(randomUUID(), {
      ...livroValido,
      titulo: 'Outro'
    }, 'b');

    const r = await auth(
      'get',
      '?page=1&pageSize=20&type=livro&q=pesquisa'
    );

    expect(r.status).toBe(200);

    expect(r.body.pagination).toEqual({
      page: 1,
      pageSize: 20,
      total: 1
    });

    expect(r.body.data[0].id)
      .toBe(body.data.id);

    expect(
      (await auth('get')).body.pagination.total
    ).toBe(1);

    const detalhe = await auth(
      'get',
      '/' + body.data.id
    );

    expect(detalhe.body.data.documento.autores)
      .toEqual(livroValido.autores);

    expect(detalhe.body.data.documento.titulo)
      .toBe(livroValido.titulo);
  });

  test('edita com version, rejeita edição concorrente e isola o proprietário', async () => {
    const { body } = await salvar();

    const path = '/' + body.data.id;

    const novos = {
      ...livroValido,
      titulo: 'Título atualizado',
      version: 1
    };

    expect(
      (await auth('get', path, 'b')).status
    ).toBe(404);

    expect(
      (await auth('put', path, 'b').send(novos)).status
    ).toBe(404);

    expect(
      (await auth('delete', path, 'b')).status
    ).toBe(404);

    expect(
      (await auth('put', path).send(livroValido)).status
    ).toBe(422);

    const editada = await auth('put', path)
      .send(novos);

    expect(editada.status).toBe(200);

    expect(editada.body.data.version).toBe(2);

    expect(editada.body.data.textoPuro)
      .toContain('Título atualizado');

    expect(
      (await auth('put', path).send(novos)).status
    ).toBe(409);

    const excluida = await auth('delete', path);

    expect(excluida.status).toBe(204);

    expect(excluida.text).toBe('');

    expect(
      (await auth('get', path)).status
    ).toBe(404);
  });

});