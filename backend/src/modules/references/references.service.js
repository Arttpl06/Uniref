import { documentoLivroSchema } from '../../../../shared/schemas/livro.js';

import { formatReferencia } from '../../domain/formatters/index.js';

export function gerarPreviaReferencia(dados) {

  // Validar os dados recebidos
  const documento = documentoLivroSchema.parse(dados);

  // Gerar a referência usando o motor ABNT
  const resultado = formatReferencia(documento);

  return resultado;
}