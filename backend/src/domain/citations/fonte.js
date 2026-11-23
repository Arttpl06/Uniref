import { ehArtigoInicial, splitNomePessoa } from "../formatters/helpers.js";

// Conta grupos vocálicos (sequências de vogais) para reconhecer monossílabos
// na entrada pelo título (6.1.1.4 d): "Nos canaviais [...]".
function ehMonossilabo(palavra) {
  const grupos =
    String(palavra ?? "")
      .toLocaleLowerCase("pt-BR")
      .match(/[aeiouáéíóúâêîôûãõäëïöü]+/g) ?? [];
  return grupos.length === 1;
}

// Extrai a chamada de responsabilidade do título quando não há autoria (6.1.1.4).
// a) título de uma palavra: a própria palavra.
// b) título de mais de uma palavra: primeira palavra + [...].
// c) título iniciado por artigo: artigo + palavra seguinte + [...].
// d) título iniciado por monossílabo: monossílabo + palavra seguinte + [...].
// A pontuação que separa título e subtítulo fica fora da chamada
// (exemplos da norma: "Inglês", "Nos canaviais [...]").
export function formatarEntradaTitulo(titulo) {
  const palavras = String(titulo ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((palavra) => palavra.replace(/[,;:]+$/, ""))
    .filter(Boolean);

  if (palavras.length === 0) return "";

  if (palavras.length === 1) return palavras[0];

  const primeira = palavras[0];

  if (ehArtigoInicial(primeira) || ehMonossilabo(primeira)) {
    return `${primeira} ${palavras[1]} [...]`;
  }

  return `${primeira} [...]`;
}

// Extrai metadados de um livro para a chamada da citação (6.1.1).
// 6.1.1.1: pessoa física — sobrenome na grafia original (maiúsculas e minúsculas).
// 6.1.1.2: pessoa jurídica — nome completo ou sigla, como digitado.
// 6.1.1.3: instituição governamental — órgão superior ou jurisdição, ignora subordinacao.
export function extrairFonteLivro(documento) {
  const entradas = [];

  if (documento.autoria === "conhecida" && Array.isArray(documento.autores)) {
    for (const autor of documento.autores) {
      if (autor.tipo === "pessoa") {
        const { sobrenome } = splitNomePessoa(autor.nome);
        if (sobrenome) {
          entradas.push({ texto: sobrenome, tipo: "pessoa" });
        }
      } else {
        const nomeInstituicao = String(autor.nomeInstituicao ?? "").trim();
        if (nomeInstituicao) {
          entradas.push({ texto: nomeInstituicao, tipo: "instituicao" });
        }
      }
    }
  }

  return {
    entradas,
    ano: String(documento.anoPublicacao ?? "").trim(),
    titulo: String(documento.titulo ?? "").trim(),
    quantidadeAutores: documento.quantidadeAutores,
    abreviacao: documento.abreviacao === true,
  };
}
