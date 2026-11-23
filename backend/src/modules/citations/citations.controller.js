import { randomUUID } from 'node:crypto';
import { gerarPreviaCitacao } from './citations.service.js';

export function preview(req, res) {
  try {
    // Receber os dados e gerar a citação
    const resultado = gerarPreviaCitacao(req.body);

    // Retornar a citação gerada
    return res.status(200).json({
      data: resultado
    });

  } catch (error) {

    // Erros de validação do Zod
    if (error.name === 'ZodError') {
      return res.status(422).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Revise os campos indicados.',
          fields: error.issues.map(issue => ({
            path: issue.path.join('.'),
            message: issue.message
          })),
          requestId: randomUUID()
        }
      });
    }

    // Tipo de documento sem extrator de citação
    if (error.name === 'FonteNaoSuportadaError') {
      return res.status(422).json({
        error: {
          code: error.code,
          message: error.message,
          fields: [{
            path: 'fonte',
            message: error.message
          }],
          requestId: randomUUID()
        }
      });
    }

    console.error('Erro ao gerar citação:', error);

    return res.status(500).json({
      error: {
        code: 'INTERNAL',
        message: 'Falha interna.',
        requestId: randomUUID()
      }
    });
  }
}
