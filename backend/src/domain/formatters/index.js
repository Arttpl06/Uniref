import { formatLivro } from "./livro.js";

export class TipoDeReferenciaNaoSuportadoError extends Error {
  constructor(tipo) {
    super(`Tipo de referência não suportado: ${tipo ?? "(ausente)"}.`);
    this.name = "TipoDeReferenciaNaoSuportadoError";
    this.code = "TIPO_DE_REFERENCIA_NAO_SUPORTADO";
    this.tipo = tipo ?? null;
  }
}

const formatadores = {
  livro: formatLivro,
};

export const TIPOS_DE_REFERENCIA_SUPORTADOS = Object.freeze(
  Object.keys(formatadores)
);

// Ponto único de entrada do motor. Recebe um documento já validado.
// A validação de forma/limites fica nos schemas de shared/.
export function formatReferencia(documento, perfil = {}) {
  const tipo = documento?.tipo;
  const formatador = formatadores[tipo];

  if (!formatador) {
    throw new TipoDeReferenciaNaoSuportadoError(tipo);
  }

  return formatador(documento, perfil);
}

export { formatLivro };
