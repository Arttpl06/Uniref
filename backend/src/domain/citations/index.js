import { extrairFonteLivro } from "./fonte.js";
import { formatarChamada } from "./chamada.js";
import { VERSAO_FORMATADOR, VERSAO_NORMA } from "./version.js";

export class FonteNaoSuportadaError extends Error {
  constructor(tipo) {
    super(`Fonte não suportada para citação: ${tipo ?? "(ausente)"}.`);
    this.name = "FonteNaoSuportadaError";
    this.code = "FONTE_NAO_SUPORTADA";
    this.tipo = tipo ?? null;
  }
}

const extratores = {
  livro: extrairFonteLivro,
};

export const TIPOS_DE_FONTE_SUPORTADOS = Object.freeze(
  Object.keys(extratores)
);

// Ponto único de entrada do motor. Recebe o documento já validado e devolve a
// chamada parentética do sistema autor-data (NBR 10520:2023).
// Um extrator por tipo de documento; as regras de chamada são as mesmas.
export function formatarCitacao(documento) {
  const tipo = documento?.tipo;
  const extrator = extratores[tipo];

  if (!extrator) {
    throw new FonteNaoSuportadaError(tipo);
  }

  return {
    chamada: formatarChamada(extrator(documento)),
    avisos: [],
    versaoNorma: VERSAO_NORMA,
    versaoFormatador: VERSAO_FORMATADOR,
  };
}

export { extrairFonteLivro };
