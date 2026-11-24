import { randomUUID } from 'node:crypto';
import { getMyProfile } from '../auth/auth.service.js';

import {
  gerarPreviaReferencia,
  salvarReferencia,
  listarReferencias,
  consultarReferencia,
  editarReferencia,
  excluirReferencia
} from './references.service.js';

function responderErro(req, res, error) {
  const requestId = req.requestId ?? randomUUID();

  if (error.name === 'ZodError') {
    return res.status(422).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Revise os campos indicados.',
        fields: error.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message
        })),
        requestId
      }
    });
  }

  if ([403, 404, 409, 422].includes(error.status) && error.code) {
    return res.status(error.status).json({
      error: {
        code: error.code,
        message: error.message,
        requestId
      }
    });
  }

  if (error.name === 'TipoDeReferenciaNaoSuportadoError') {
    return res.status(422).json({
      error: {
        code: error.code,
        message: 'Tipo de referência não suportado.',
        requestId
      }
    });
  }

  if (/^Sequelize(Connection|Host|AccessDenied)/.test(error.name ?? '')) {
    return res.status(503).json({
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Serviço temporariamente indisponível.',
        requestId
      }
    });
  }

  console.error({
    requestId,
    status: 500,
    code: 'INTERNAL'
  });

  return res.status(500).json({
    error: {
      code: 'INTERNAL',
      message: 'Falha interna.',
      requestId
    }
  });
}

// Gerar prévia
export function preview(req, res) {
  try {
    return res.status(200).json({
      data: gerarPreviaReferencia(req.body)
    });
  } catch (error) {
    return responderErro(req, res, error);
  }
}

// Identificar o usuário autenticado
export async function carregarUsuario(req, res, next) {
  try {
    const usuario = await getMyProfile(req.firebaseUser);

    if (!usuario) {
      return res.status(404).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: 'Usuário não encontrado. Sincronize sua conta.',
          requestId: req.requestId ?? randomUUID()
        }
      });
    }

    req.usuarioId = usuario.id;

    return next();
  } catch (error) {
    return responderErro(req, res, error);
  }
}

// POST - Salvar referência
export async function create(req, res) {
  try {
    const { status, data } = await salvarReferencia(
      req.usuarioId,
      req.get('Idempotency-Key'),
      req.body
    );

    return res.status(status).json({ data });
  } catch (error) {
    return responderErro(req, res, error);
  }
}

// GET - Listar referências
export async function list(req, res) {
  try {
    return res.status(200).json(
      await listarReferencias(req.usuarioId, req.query)
    );
  } catch (error) {
    return responderErro(req, res, error);
  }
}

// GET - Consultar referência pelo ID
export async function getById(req, res) {
  try {
    return res.status(200).json({
      data: await consultarReferencia(
        req.usuarioId,
        req.params.id
      )
    });
  } catch (error) {
    return responderErro(req, res, error);
  }
}

// PUT - Editar referência
export async function update(req, res) {
  try {
    return res.status(200).json({
      data: await editarReferencia(
        req.usuarioId,
        req.params.id,
        req.body
      )
    });
  } catch (error) {
    return responderErro(req, res, error);
  }
}

// DELETE - Excluir referência
export async function remove(req, res) {
  try {
    await excluirReferencia(
      req.usuarioId,
      req.params.id
    );

    return res.status(204).end();
  } catch (error) {
    return responderErro(req, res, error);
  }
}