import { randomUUID } from 'node:crypto';
import { Op } from 'sequelize';

import { sequelize } from '../../config/database.js';
import { Reference } from '../../database/models/Reference.js';
import { ReferenceAuthor } from '../../database/models/ReferenceAuthor.js';

import '../../database/models/associations.js';

// Procurar uma referência pela chave de idempotência
export async function findByIdempotencyKey(usuarioId, idempotencyKey) {
  return Reference.findOne({
    where: {
      usuarioId,
      idempotencyKey
    }
  });
}

// Preparar autores mantendo a ordem original
function prepararAutores(referenciaId, autores) {
  return autores.map((autor, index) => ({
    id: randomUUID(),
    referenciaId,
    posicao: index + 1,
    tipo: autor.tipo,

    nome: autor.tipo === 'pessoa'
      ? autor.nome
      : null,

    nomeInstituicao: autor.tipo === 'instituicao'
      ? autor.nomeInstituicao
      : null,

    subordinacao: autor.tipo === 'instituicao'
      ? (autor.subordinacao ?? null)
      : null
  }));
}

// Salvar a referência e seus autores
export async function createReferenceWithAuthors(dados, autores) {
  return sequelize.transaction(async (transaction) => {

    // 1. Criar a referência
    const referencia = await Reference.create(dados, {
      transaction
    });

    // 2. Preparar os autores
    const autoresParaSalvar = prepararAutores(
      referencia.id,
      autores
    );

    // 3. Salvar os autores
    if (autoresParaSalvar.length > 0) {
      await ReferenceAuthor.bulkCreate(autoresParaSalvar, {
        transaction
      });
    }

    // 4. Retornar a referência criada
    return referencia;
  });
}

// Listar referências do usuário
export async function listReferences(
  usuarioId,
  { type, q, offset, limit }
) {
  const where = {
    usuarioId
  };

  // Filtrar pelo tipo de obra
  if (type) {
    where.tipo = type;
  }

  // Pesquisar pelo título
  if (q) {
    where.titulo = {
      [Op.like]: `%${q.replace(/[\\%_]/g, '\\$&')}%`
    };
  }

  return Reference.findAndCountAll({
    where,
    offset,
    limit,

    attributes: [
      'id',
      'tipo',
      'titulo',
      'textoPuro',
      'versaoNorma',
      'versaoFormatador',
      'perfilInstitucional',
      'version',
      'createdAt',
      'updatedAt'
    ],

    order: [
      ['createdAt', 'DESC'],
      ['id', 'DESC']
    ]
  });
}

// Consultar referência pelo ID e proprietário
export async function findReferenceById(usuarioId, id) {
  return Reference.findOne({
    where: {
      id,
      usuarioId
    },

    include: [
      {
        model: ReferenceAuthor,
        as: 'autores'
      }
    ],

    order: [
      [
        {
          model: ReferenceAuthor,
          as: 'autores'
        },
        'posicao',
        'ASC'
      ]
    ]
  });
}

// Atualizar referência e autores
export async function updateReferenceWithAuthors(
  usuarioId,
  id,
  version,
  dados,
  autores
) {
  return sequelize.transaction(async (transaction) => {

    // Atualizar somente se a versão estiver correta
    const [alteradas] = await Reference.update(
      {
        ...dados,
        version: version + 1
      },
      {
        where: {
          id,
          usuarioId,
          version
        },

        transaction
      }
    );

    // Verificar se houve conflito de versão
    if (!alteradas) {
      const existente = await Reference.findOne({
        where: {
          id,
          usuarioId
        },

        attributes: ['id'],
        transaction,
        lock: transaction.LOCK.UPDATE
      });

      return {
        status: existente ? 409 : 404
      };
    }

    // Remover os autores antigos
    await ReferenceAuthor.destroy({
      where: {
        referenciaId: id
      },

      transaction
    });

    // Salvar os autores atualizados
    if (autores.length > 0) {
      await ReferenceAuthor.bulkCreate(
        prepararAutores(id, autores),
        {
          transaction
        }
      );
    }

    // Buscar a referência atualizada
    const ref = await Reference.findOne({
      where: {
        id,
        usuarioId
      },

      transaction
    });

    return {
      status: 200,
      ref
    };
  });
}

// Excluir referência do usuário
export async function deleteReference(usuarioId, id) {
  return Reference.destroy({
    where: {
      id,
      usuarioId
    }
  });
}