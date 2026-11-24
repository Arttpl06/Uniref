import { createHash } from 'node:crypto';
import { z } from 'zod';
import { documentoReferenciaSchema } from '../../../../shared/schemas/reference.js';
import { formatReferencia } from '../../domain/formatters/index.js';

const uuidSchema = z.uuid();

const versionSchema = z.number()
  .int()
  .min(1)
  .max(2147483646);

const tipos = [
  'livro',
  'artigoPeriodico',
  'paginaWeb',
  'trabalhoAcademico'
];

const inteiroQuery = (max) => z.string()
  .regex(/^\d+$/)
  .transform(Number)
  .pipe(z.number().int().min(1).max(max));

const querySchema = z.strictObject({
  page: inteiroQuery(Number.MAX_SAFE_INTEGER).optional(),
  pageSize: inteiroQuery(100).optional(),
  type: z.enum(tipos).optional(),
  q: z.string().trim().max(1000).optional()
});

function erro(status, code, message) {
  return Object.assign(new Error(message), {
    status,
    code
  });
}

const naoEncontrada = () =>
  erro(404, 'NOT_FOUND', 'Referência não encontrada.');

const conflitoChave = () =>
  erro(
    409,
    'IDEMPOTENCY_CONFLICT',
    'Chave de idempotência já utilizada com outros dados.'
  );

// Gerar prévia sem acessar o banco
export function gerarPreviaReferencia(dados) {
  const documento = documentoReferenciaSchema.parse(dados);

  return formatReferencia(documento);
}

// Padronizar o documento para gerar o hash
function canonico(valor) {
  if (Array.isArray(valor)) {
    return valor.map(canonico);
  }

  if (valor !== null && typeof valor === 'object') {
    return Object.fromEntries(
      Object.keys(valor)
        .sort()
        .map(chave => [chave, canonico(valor[chave])])
    );
  }

  return valor;
}

// Preparar os dados para salvar no banco
function prepararPersistencia(documento) {
  const {
    tipo,
    titulo,
    autoria,
    quantidadeAutores,
    autores,
    ...metadata
  } = documento;

  return {
    tipo,
    titulo,
    autoria,
    quantidadeAutores,
    metadata,
    ...formatReferencia(documento),
    schemaVersion: 1
  };
}

// Preparar os dados da listagem
function resumo(ref) {
  const {
    id,
    tipo,
    titulo,
    textoPuro,
    versaoNorma,
    versaoFormatador,
    perfilInstitucional,
    version,
    createdAt,
    updatedAt
  } = ref;

  return {
    id,
    tipo,
    titulo,
    textoPuro,
    versaoNorma,
    versaoFormatador,
    perfilInstitucional,
    version,
    createdAt,
    updatedAt
  };
}

// Preparar a resposta da referência salva
function resultadoSalvo(ref) {
  return {
    ...resumo(ref),
    segmentos: ref.segmentos,
    avisos: ref.avisos
  };
}

// Reconstruir os dados bibliográficos originais
function documentoOriginal(ref) {
  return {
    ...ref.metadata,

    tipo: ref.tipo,
    titulo: ref.titulo,
    autoria: ref.autoria,

    ...(ref.quantidadeAutores == null
      ? {}
      : { quantidadeAutores: ref.quantidadeAutores }),

    autores: [...ref.autores]
      .sort((a, b) => a.posicao - b.posicao)
      .map(autor =>
        autor.tipo === 'pessoa'
          ? {
              tipo: 'pessoa',
              nome: autor.nome
            }
          : {
              tipo: 'instituicao',
              nomeInstituicao: autor.nomeInstituicao,
              subordinacao: autor.subordinacao
            }
      )
  };
}

// POST - Salvar referência
export async function salvarReferencia(usuarioId, chave, dados) {
  const { idempotencyKey } = z.object({
    idempotencyKey: uuidSchema
  }).parse({
    idempotencyKey: chave
  });

  const documento = documentoReferenciaSchema.parse(dados);

  const requestHash = createHash('sha256')
    .update(JSON.stringify(canonico(documento)))
    .digest('hex');

  const repo = await import('./references.repository.js');

  const chaveNormalizada = idempotencyKey.toLowerCase();

  // Verificar repetição da requisição
  function repeticao(ref) {
    if (ref.requestHash !== requestHash) {
      throw conflitoChave();
    }

    return {
      status: 200,
      data: resultadoSalvo(ref)
    };
  }

  const existente = await repo.findByIdempotencyKey(
    usuarioId,
    chaveNormalizada
  );

  if (existente) {
    return repeticao(existente);
  }

  try {
    const ref = await repo.createReferenceWithAuthors(
      {
        ...prepararPersistencia(documento),
        usuarioId,
        idempotencyKey: chaveNormalizada,
        requestHash
      },
      documento.autores
    );

    return {
      status: 201,
      data: resultadoSalvo(ref)
    };
  } catch (error) {
    // Tratar requisições simultâneas com a mesma chave
    if (error.name !== 'SequelizeUniqueConstraintError') {
      throw error;
    }

    const ref = await repo.findByIdempotencyKey(
      usuarioId,
      chaveNormalizada
    );

    if (!ref) {
      throw error;
    }

    return repeticao(ref);
  }
}

// GET - Listar referências
export async function listarReferencias(usuarioId, query) {
  const {
    page = 1,
    pageSize = 20,
    type,
    q
  } = querySchema.parse(query);

  const offset = (page - 1) * pageSize;

  if (!Number.isSafeInteger(offset)) {
    throw erro(
      422,
      'VALIDATION_ERROR',
      'Página fora do limite.'
    );
  }

  const repo = await import('./references.repository.js');

  const { rows, count } = await repo.listReferences(
    usuarioId,
    {
      type,
      q,
      offset,
      limit: pageSize
    }
  );

  return {
    data: rows.map(resumo),

    pagination: {
      page,
      pageSize,
      total: count
    }
  };
}

// GET - Consultar referência pelo ID
export async function consultarReferencia(usuarioId, id) {
  z.object({
    id: uuidSchema
  }).parse({ id });

  const repo = await import('./references.repository.js');

  const ref = await repo.findReferenceById(usuarioId, id);

  if (!ref) {
    throw naoEncontrada();
  }

  return {
    ...resultadoSalvo(ref),
    documento: documentoOriginal(ref)
  };
}

// PUT - Editar referência
export async function editarReferencia(usuarioId, id, dados) {
  z.object({
    id: uuidSchema
  }).parse({ id });

  const { version } = z.object({
    version: versionSchema
  }).parse(dados);

  // Separar a versão dos dados bibliográficos
  const { version: _version, ...campos } = dados;

  const documento = documentoReferenciaSchema.parse(campos);

  const repo = await import('./references.repository.js');

  const resultado = await repo.updateReferenceWithAuthors(
    usuarioId,
    id,
    version,
    prepararPersistencia(documento),
    documento.autores
  );

  if (resultado.status === 404) {
    throw naoEncontrada();
  }

  if (resultado.status === 409) {
    throw erro(
      409,
      'VERSION_CONFLICT',
      'A referência foi alterada. Recarregue antes de editar.'
    );
  }

  return resultadoSalvo(resultado.ref);
}

// DELETE - Excluir referência
export async function excluirReferencia(usuarioId, id) {
  z.object({
    id: uuidSchema
  }).parse({ id });

  const repo = await import('./references.repository.js');

  const excluida = await repo.deleteReference(usuarioId, id);

  if (!excluida) {
    throw naoEncontrada();
  }
}