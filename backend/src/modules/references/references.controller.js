import { randomUUID } from 'node:crypto';
import { gerarPreviaReferencia } from './references.service.js';

export function preview(req, res) {
  try {
    // Receber os dados e gerar a referência
    const resultado = gerarPreviaReferencia(req.body);

    // Retornar a referência formatada
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

    
    console.error('Erro ao gerar referência:', error);

    return res.status(500).json({
      error: {
        code: 'INTERNAL',
        message: 'Falha interna.',
        requestId: randomUUID()
      }
    });
  }
}
