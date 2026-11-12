// Funções compartilhadas pelo motor de referências.

const MESES = [
  "jan.",
  "fev.",
  "mar.",
  "abr.",
  "maio",
  "jun.",
  "jul.",
  "ago.",
  "set.",
  "out.",
  "nov.",
  "dez.",
];

// Abreviações de participação previstas na NBR 6023:2025, 8.1.1.4.
const QUALIFICADORES_RESPONSABILIDADE = {
  Editor: "ed.",
  Organizador: "org.",
  Compilador: "comp.",
};

// Artigos definidos e indefinidos usados na entrada pelo título (8.2.1).
// A lista cobre os idiomas mais comuns em referências brasileiras.
const ARTIGOS_INICIAIS = new Set([
  "a",
  "o",
  "as",
  "os",
  "um",
  "uma",
  "uns",
  "umas",
  "the",
  "an",
  "el",
  "la",
  "los",
  "las",
  "un",
  "una",
  "le",
  "les",
  "l'",
  "il",
  "lo",
  "i",
  "gli",
]);

// Termos da norma (8.5.6): permanecem como abreviaturas normalizadas.
const SINE_LOCO = /^\[\s*s\.?\s*l\.?\s*\]$/i;
const SINE_NOMINE = /^\[\s*s\.?\s*n\.?\s*\]$/i;

// Natureza jurídica/comercial que a NBR 6023:2025, 8.5, manda suprimir da editora.
const NATUREZA_JURIDICA =
  /\s+(?:S\.?\s*A\.?|S\/A|LTDA\.?|ME|EPP|EIRELI(?:-?ME)?)\.?$/i;

const ROTULOS_PAGINACAO = {
  paginas: "p.",
  volumes: "v.",
  folhas: "f.",
};

// Rótulos dos suportes físicos conforme os exemplos da NBR 6023:2025:
// 7.2.1 e 8.7.1 ("5 CD-ROM", "1 DVD", "3 discos blu-ray").
// E-book aparece como "E-book (213 p.)" — sem quantidade, sempre.
const ROTULOS_SUPORTE = {
  cdrom: "CD-ROM",
  dvd: "DVD",
  ebook: "E-book",
  blu_ray: "disco blu-ray",
};

// Plural dos rótulos que variam com a quantidade (norma: "3 discos blu-ray").
const ROTULOS_SUPORTE_PLURAL = {
  blu_ray: "discos blu-ray",
};

// Terminações que fazem parte do sobrenome (8.1.1.3 b):
// "Assaf Neto" -> ASSAF NETO, "Grisard Filho" -> GRISARD FILHO.
const SUFIXOS_PARENTESCO = new Set([
  "filho",
  "filha",
  "neto",
  "sobrinho",
  "junior",
]);

// Prefixos de sobrenome (8.1.1.3 d): "La Torre" -> LA TORRE.
// "de/da/dos" ficam fora de propósito: no Brasil costumam ficar com os
// prenomes ("SILVA, De Plácido e"), e forçá-los no sobrenome quebraria o caso comum.
const PREFIXOS_SOBRENOME = new Set([
  "la",
  "le",
  "las",
  "les",
  "lo",
  "los",
  "van",
  "von",
  "di",
  "saint",
]);

// Comparação sem acento/caixa para reconhecer sufixos e prefixos.
function foldPalavra(word) {
  return word
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// Garante um único ponto final sem duplicar pontuação já existente.
export function comPonto(texto) {
  const valor = String(texto ?? "").trim();
  if (!valor) return "";
  return /[.!?]$/.test(valor) ? valor : `${valor}.`;
}

// Deixa em maiúsculas o texto fora dos parênteses, preservando parênteses
// aninhados. Exemplo: "São Paulo (Estado)" -> "SÃO PAULO (Estado)".
export function maiusculasForaDosParenteses(texto) {
  let saida = "";
  let profundidade = 0;

  for (const char of String(texto ?? "").trim()) {
    if (char === "(") {
      profundidade += 1;
    }

    if (profundidade === 0) {
      saida += char.toLocaleUpperCase("pt-BR");
    } else {
      saida += char;
    }

    if (char === ")") {
      profundidade = Math.max(0, profundidade - 1);
    }
  }

  return saida;
}

// Normaliza a grafia de "[S. l.]" (8.5.6); outros valores passam intactos.
export function normalizarLocal(valor) {
  const text = String(valor ?? "").trim();
  return SINE_LOCO.test(text) ? "[S. l.]" : text;
}

// Normaliza a grafia de "[s. n.]" (8.5.6); outros valores passam intactos.
export function normalizarEditora(valor) {
  const text = String(valor ?? "").trim();
  return SINE_NOMINE.test(text) ? "[s. n.]" : text;
}

// 8.5: suprime S.A., Ltda., ME, EPP, EIRELI do final do nome da editora.
export function stripNaturezaJuridica(valor) {
  return String(valor ?? "")
    .replace(NATUREZA_JURIDICA, "")
    .trim();
}

// Extrai o sobrenome do nome completo informado em campo único (8.1.1).
// Ordem das regras: final de parentesco -> prefixo de sobrenome -> última palavra.
export function splitNomePessoa(nome) {
  const palavras = String(nome ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .filter(Boolean);

  if (palavras.length <= 1) {
    return { sobrenome: palavras[0] ?? "", prenomes: "" };
  }

  const ultima = foldPalavra(palavras[palavras.length - 1]);
  const penultima = foldPalavra(palavras[palavras.length - 2]);

  if (SUFIXOS_PARENTESCO.has(ultima) || PREFIXOS_SOBRENOME.has(penultima)) {
    return {
      sobrenome: palavras.slice(-2).join(" "),
      prenomes: palavras.slice(0, -2).join(" "),
    };
  }

  return {
    sobrenome: palavras[palavras.length - 1],
    prenomes: palavras.slice(0, -1).join(" "),
  };
}

// "Eduardo Santos" -> "SANTOS, Eduardo"; "Alexandre Assaf Neto" -> "ASSAF NETO, Alexandre".
export function formatAutorPessoa(autor) {
  const { sobrenome, prenomes } = splitNomePessoa(autor.nome);

  if (!prenomes) {
    return maiusculasForaDosParenteses(sobrenome);
  }

  return `${maiusculasForaDosParenteses(sobrenome)}, ${prenomes}`;
}

// 8.1.2.2: a instituição autora é a entrada e fica em maiúsculas; o órgão
// subordinado a ela vem depois, com a grafia do documento.
// Exemplos da norma: "BRASIL. Ministério da Justiça." / "SÃO PAULO (Estado). Secretaria do Meio Ambiente."
// Sem subordinação, o nome da instituição é a entrada e fica em maiúsculas.
export function formatAutorInstituicao(autor) {
  const instituicao = maiusculasForaDosParenteses(autor.nomeInstituicao);
  const subordinacao = String(autor.subordinacao ?? "").trim();

  if (!subordinacao) return instituicao;

  return `${instituicao}. ${subordinacao}`;
}

export function formatAutor(autor) {
  return autor.tipo === "pessoa"
    ? formatAutorPessoa(autor)
    : formatAutorInstituicao(autor);
}

// Monta a lista de autores com a pontuação da NBR 6023:2025, 8.1.1.
// Retorna null quando a entrada é pelo título (autoria desconhecida).
// A abreviação com "et al." é decidida por quantidadeAutores (campo do formulário),
// não pelo tamanho da lista: com abreviação, o front envia só o primeiro nome.
export function formatAutores(document, avisos = []) {
  if (document.autoria !== "conhecida") return null;

  const autores = Array.isArray(document.autores) ? document.autores : [];
  if (autores.length === 0) {
    avisos.push({
      codigo: "AUTORES_AUSENTES",
      campo: "autores",
      mensagem:
        "Autoria conhecida sem autores: a referência entra pelo título.",
    });
    return null;
  }

  const informado = Number(document.quantidadeAutores);
  const quantidade = Number.isInteger(informado) && informado > 0
      ? informado
      : autores.length;

  if (document.abreviacao === true && quantidade < 4) {
    avisos.push({
      codigo: "ABREVIACAO_IGNORADA",
      campo: "abreviacao",
      mensagem:
        "A abreviação com et al. só se aplica quando há quatro ou mais autores.",
    });
  }

  const abreviar = document.abreviacao === true && quantidade >= 4;

  if (!abreviar && autores.length < quantidade) {
    avisos.push({
      codigo: "AUTORES_AUSENTES",
      campo: "autores",
      mensagem: `A quantidade indicada foi ${quantidade}, mas apenas ${autores.length} autor(es) foram informados.`,
    });
  }

  const nomes = abreviar
    ? [`${formatAutor(autores[0])} et al.`]
    : autores.map(formatAutor);

  const qualificador = QUALIFICADORES_RESPONSABILIDADE[document.responsabilidade];
  const joined = nomes.join("; ");

  if (qualificador) {
    return `${joined} (${qualificador}).`;
  }

  // comPonto evita ponto duplicado quando o nome já termina em abreviação.
  return comPonto(joined);
}

// 8.1.4 e 8.2.1: entrada pelo título, com a primeira palavra em maiúsculas.
// Se a primeira palavra for artigo, a palavra seguinte também fica em maiúsculas.
export function formatEntradaTitulo(titulo) {
  const palavras = String(titulo ?? "")
    .trim()
    .split(/\s+/);

  if (palavras.length === 0) return "";

  const primeira = palavras[0]
    .toLocaleLowerCase("pt-BR")
    .replace(/[^\p{L}']/gu, "");

  const maiusculas = ARTIGOS_INICIAIS.has(primeira) ? 2 : 1;

  return palavras
    .map((palavra, index) =>
      index < maiusculas ? palavra.toLocaleUpperCase("pt-BR") : palavra
    )
    .join(" ");
}

// Converte AAAA-MM-DD em "21 ago. 2011", conforme 8.6.3 e Anexo A.
export function formatDataPublicacao(dataIso) {
  const texto = String(dataIso ?? "").trim();
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(texto);
  if (!partes) return null;

  const ano = partes[1];
  const mes = Number(partes[2]) - 1;
  const dia = Number(partes[3]);

  if (mes < 0 || mes > 11 || dia < 1 || dia > 31) {
    return null;
  }

  return `${dia} ${MESES[mes]} ${ano}`;
}

export const formatDataAcesso = formatDataPublicacao;

// 8.3: "3" vira "3. ed."; texto já formatado é preservado.
export function formatEdicao(valor) {
  const text = String(valor ?? "").trim();
  if (!text) return null;

  if (/^\d+$/.test(text)) {
    return `${text}. ed.`;
  }

  if (/^\d+\s*[ªº]$/.test(text)) {
    return `${text.replace(/[^\d]/g, "")}. ed.`;
  }

  if (/^\d+\.\s*ed\.?$/i.test(text)) {
    return comPonto(text);
  }

  return comPonto(text);
}

// 8.4, 8.5 e 8.5.6: local, editora e data de publicação.
export function formatPublicacao(document) {
  const local = normalizarLocal(document.localPublicacao);
  const editora = stripNaturezaJuridica(normalizarEditora(document.editora));
  const ano = String(document.anoPublicacao ?? "").trim();

  if (!local || !editora || !ano) return null;

  if (local === "[S. l.]" && editora === "[s. n.]") {
    return comPonto(`[S. l.: s. n.], ${ano}`);
  }

  return comPonto(`${local}: ${editora}, ${ano}`);
}

// Corpo da descrição física (8.7.2), sem pontuação final: "326 p.".
// Rótulo já presente em qualquer posição ("326 p.", "5 v. em 3", "p. 1-90")
// é preservado; sem rótulo, ele é anexado ao valor.
function corpoNumeracaoPaginas(numeracaoPaginas) {
  if (!numeracaoPaginas) return null;

  const rotulo = ROTULOS_PAGINACAO[numeracaoPaginas.tipo];
  if (!rotulo) return null;

  const valor = String(numeracaoPaginas.valor ?? "").trim();
  if (!valor) return null;

  const abreviatura = rotulo.replace(".", "");
  const rotuloEmQualquerLugar = new RegExp(
    `(?:^|\\s)${abreviatura}\\.?(?:\\s|$)`,
    "i"
  ).test(valor);

  if (rotuloEmQualquerLugar) return valor;

  return `${valor} ${rotulo}`;
}

// 8.7.2: "326" vira "326 p."; "326 p." e "5 v. em 3" são preservados.
export function formatNumeracaoPaginas(numeracaoPaginas) {
  const body = corpoNumeracaoPaginas(numeracaoPaginas);
  return body ? comPonto(body) : null;
}

// 8.7.1, 8.7.3 e 7.2.1: "5 CD-ROM", "1 DVD", "3 discos blu-ray", "E-book".
// Quando há descrição física e o suporte não é "nenhum", a contagem de páginas
// entra como detalhe do suporte: "E-book (213 p.)", "1 CD-ROM (p. 1-90)".
// E-book nunca recebe quantidade (7.2.1: "... 2014. E-book.").
export function formatSuporteFisico(descricao, numeracaoPaginas = null) {
  if (!descricao || descricao.meio === "nenhum") return null;

  const rotuloBase =
    descricao.meio === "outro"
      ? String(descricao.outroMeio ?? "").trim()
      : ROTULOS_SUPORTE[descricao.meio];

  if (!rotuloBase) return null;

  const quantidade = String(descricao.quantidade ?? "").trim();

  // E-book: só o rótulo, sem quantidade ("1 e-book" não existe na norma).
  if (descricao.meio === "ebook") {
    return comPonto(comDetalhe(rotuloBase, numeracaoPaginas));
  }

  let suporte;
  if (!quantidade) {
    suporte = rotuloBase;
  } else if (
    quantidade.toLocaleLowerCase("pt-BR").includes(rotuloBase.toLocaleLowerCase("pt-BR"))
  ) {
    suporte = quantidade;
  } else if (
    descricao.meio === "blu_ray" &&
    Number.isInteger(Number(quantidade)) &&
    Number(quantidade) > 1
  ) {
    suporte = `${quantidade} ${ROTULOS_SUPORTE_PLURAL.blu_ray}`;
  } else {
    suporte = `${quantidade} ${rotuloBase}`;
  }

  return comPonto(comDetalhe(suporte, numeracaoPaginas));
}

// Junta o suporte e a descrição física: "E-book (213 p.)".
function comDetalhe(suporte, numeracaoPaginas) {
  const body = corpoNumeracaoPaginas(numeracaoPaginas);
  return body ? `${suporte} (${body})` : suporte;
}

// 8.10: "Vaga-lume, v. 12" vira "(Vaga-lume, v. 12).".
export function formatSerie(serie) {
  const text = String(serie ?? "").trim();
  if (!text) return null;

  const wrapped = /^\(.*\)$/.test(text) ? text : `(${text})`;
  return comPonto(wrapped);
}

// 6.6: endereço precedido de "Disponível em:" e acesso por "Acesso em:".
export function formatOnline(document) {
  if (!document.online) return null;

  const url = String(document.url ?? "").trim();
  const access = formatDataAcesso(document.dataAcesso);

  if (!url || !access) return null;

  const urlWithPeriod = url.endsWith(".") ? url : `${url}.`;
  return `Disponível em: ${urlWithPeriod} Acesso em: ${access}.`;
}

// Junta elementos (cada um uma lista de segmentos) com um único espaço.
// Elementos vazios são ignorados. O texto concatenado dos segmentos é a saída.
// Cada segmento tem { texto, destaque: "nenhum" | "negrito" }.
export function joinSegmentos(elements) {
  const segmentos = [];

  for (const element of elements) {
    if (!element) continue;

    const normalized =
      typeof element === "string"
        ? [{ texto: element, destaque: "nenhum" }]
        : element;

    if (normalized.length === 0) continue;

    if (segmentos.length > 0) {
      segmentos.push({ texto: " ", destaque: "nenhum" });
    }

    segmentos.push(...normalized);
  }

  return segmentos;
}
