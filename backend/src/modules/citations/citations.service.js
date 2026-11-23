import { citacaoSchema } from '../../../../shared/schemas/citacao.js';

import { formatarCitacao, FonteNaoSuportadaError } from '../../domain/citations/index.js';

export function gerarPreviaCitacao(dados) {

  // Validar os dados recebidos
  const citacao = citacaoSchema.parse(dados);

  if (!citacao.fonte.documento) {
    // Referência salva ainda não é suportada
    throw new FonteNaoSuportadaError('referenciaId');
  }

  // Gerar a chamada usando o motor ABNT
  const resultado = formatarCitacao(citacao.fonte.documento);

  return resultado;
}
