import test from "node:test";
import assert from "node:assert/strict";
import {
  formatReferencia,
  TipoDeReferenciaNaoSuportadoError,
} from "../src/domain/formatters/index.js";
import {
  formatDataAcesso,
  formatEntradaTitulo,
  maiusculasForaDosParenteses,
} from "../src/domain/formatters/helpers.js";
import { documentoLivroSchema } from "../../shared/schemas/livro.js";

// Base válida para os testes do formatter. Cada teste muda só o necessário.
function livro(overrides = {}) {
  return {
    tipo: "livro",
    autoria: "conhecida",
    responsabilidade: "Autor da Obra",
    quantidadeAutores: 1,
    abreviacao: false,
    autores: [{ tipo: "pessoa", nome: "Ana Silva" }],
    titulo: "Introdução à pesquisa",
    subtitulo: null,
    outraResponsabilidade: null,
    serie: null,
    edicao: null,
    localPublicacao: "Fortaleza",
    editora: "Editora Exemplo",
    anoPublicacao: "2025",
    notas: null,
    online: false,
    url: null,
    dataAcesso: null,
    numeracaoPaginas: null,
    suporteFisico: null,
    ...overrides,
  };
}

function assertLivro(document, expected, profile) {
  const result = formatReferencia(document, profile);

  assert.equal(result.textoPuro, expected);
  assert.equal(
    result.segmentos.map((segmento) => segmento.texto).join(""),
    expected
  );

  for (const segmento of result.segmentos) {
    assert.ok(
      segmento.destaque === "nenhum" || segmento.destaque === "negrito",
      `destaque inesperado: ${segmento.destaque}`
    );
  }

  return result;
}

// teste 1
test("formata livro mínimo e destaca apenas o título", () => {
  const result = assertLivro(
    livro(),
    "SILVA, Ana. Introdução à pesquisa. Fortaleza: Editora Exemplo, 2025."
  );

  const titulo = result.segmentos.find(
    (segmento) => segmento.texto === "Introdução à pesquisa"
  );

  assert.equal(titulo.destaque, "negrito");
});

// teste 2
test("formata título e subtítulo com os dois pontos", () => {
  const result = assertLivro(
    livro({
      autores: [
        { tipo: "pessoa", nome: "Zygmunt Bauman" },
      ],
      titulo: "Globalização",
      subtitulo: "as conseqüências humanas",
      localPublicacao: "Rio de Janeiro",
      editora: "Jorge Zahar",
      anoPublicacao: "1999",
    }),
        // gabarito literal NBR 6023:2025: 7.1.1 EXEMPLO 2 (p. 6)
    "BAUMAN, Zygmunt. Globalização: as conseqüências humanas. Rio de Janeiro: Jorge Zahar, 1999."
  );

  assert.equal(
    result.segmentos.find((segmento) => segmento.texto === "Globalização").destaque,
    "negrito"
  );
  assert.equal(
    result.segmentos.find(
      (segmento) => segmento.texto === ": as conseqüências humanas"
    ).destaque,
    "nenhum"
  );
});

// teste 3
test("formata edição numérica como N. ed.", () => {
  assertLivro(
    livro({
      autores: [
        { tipo: "pessoa", nome: "Heloisa Luck" },
      ],
      titulo: "Liderança em gestão escolar",
      edicao: "4",
      localPublicacao: "Petrópolis",
      editora: "Vozes",
      anoPublicacao: "2010",
    }),
        // gabarito literal NBR 6023:2025: 7.1.1 EXEMPLO 1 (p. 6)
    "LUCK, Heloisa. Liderança em gestão escolar. 4. ed. Petrópolis: Vozes, 2010."
  );
});

// teste 4
test("preserva edição já descrita por extenso", () => {
  assertLivro(
    livro({ edicao: "3. ed. rev. e aum." }),
    "SILVA, Ana. Introdução à pesquisa. 3. ed. rev. e aum. Fortaleza: Editora Exemplo, 2025."
  );
});

// teste 5
test("separa dois autores por ponto e vírgula", () => {
  assertLivro(
    livro({
      autores: [
        { tipo: "pessoa", nome: "A. C. Gomes" },
        { tipo: "pessoa", nome: "C. A. Vechi" },
      ],
      titulo: "Estática romântica",
      subtitulo: "textos doutrinários comentados",
      localPublicacao: "São Paulo",
      editora: "Atlas",
      anoPublicacao: "1992",
    }),
        // gabarito literal NBR 6023:2025: 7.1.1 EXEMPLO 3 (p. 6)
    "GOMES, A. C.; VECHI, C. A. Estática romântica: textos doutrinários comentados. São Paulo: Atlas, 1992."
  );
});

function quatroAutores(count, names) {
  return Array.from({ length: count }, (_, i) => ({
    tipo: "pessoa",
    nome: names[i],
  }));
}

const QUATRO_NOMES = [
  "Robert Taylor",
  "Denis Levine",
  "Denis Marcellin-Little",
  "Darryl Millis",
];

// teste 6
test("usa et al. com quatro ou mais autores quando abreviado", () => {
  const result = assertLivro(
    livro({
      autores: quatroAutores(1, QUATRO_NOMES),
      quantidadeAutores: 4,
      abreviacao: true,
      titulo: "Reabilitação e fisioterapia na prática de pequenos animais",
      localPublicacao: "São Paulo",
      editora: "Roca",
      anoPublicacao: "2008",
    }),
    "TAYLOR, Robert et al. Reabilitação e fisioterapia na prática de pequenos animais. São Paulo: Roca, 2008."
  );

  assert.equal(result.avisos.length, 0);
});

// teste 7
test("indica todos os autores quando a abreviação não foi escolhida", () => {
  assertLivro(
    livro({
      autores: quatroAutores(4, QUATRO_NOMES),
      quantidadeAutores: 4,
      abreviacao: false,
      titulo: "Reabilitação e fisioterapia na prática de pequenos animais",
      localPublicacao: "São Paulo",
      editora: "Roca",
      anoPublicacao: "2008",
    }),
        // gabarito literal NBR 6023:2025: 8.1.1.2 EXEMPLO 2 (p. 35)
    "TAYLOR, Robert; LEVINE, Denis; MARCELLIN-LITTLE, Denis; MILLIS, Darryl. Reabilitação e fisioterapia na prática de pequenos animais. São Paulo: Roca, 2008."
  );
});

// teste 8
test("ignora a abreviação com menos de quatro autores e avisa", () => {
  const result = assertLivro(
    livro({
      autores: quatroAutores(3, [
        "L. M. M. Passos",
        "A. Fonseca",
        "M. Chaves",
      ]),
      quantidadeAutores: 3,
      abreviacao: true,
      titulo:
        "Alegria de saber: matemática, segunda série, 2, primeiro grau: livro do professor",
      localPublicacao: "São Paulo",
      editora: "Scipione",
      anoPublicacao: "1995",
      numeracaoPaginas: { tipo: "paginas", valor: "136" },
    }),
        // gabarito literal NBR 6023:2025: 8.1.1.1 EXEMPLO 2 (p. 35)
    "PASSOS, L. M. M.; FONSECA, A.; CHAVES, M. Alegria de saber: matemática, segunda série, 2, primeiro grau: livro do professor. São Paulo: Scipione, 1995. 136 p."
  );

  assert.equal(result.avisos.length, 1);
  assert.equal(result.avisos[0].codigo, "ABREVIACAO_IGNORADA");
});

// teste 9
test("formata autor institucional em maiúsculas", () => {
  assertLivro(
    livro({
      autores: [
        {
          tipo: "instituicao",
          nomeInstituicao: "Associação Brasileira de Normas Técnicas",
          subordinacao: null,
        },
      ],
      titulo:
        "ABNT NBR 14724: informação e documentação: trabalhos acadêmicos: apresentação",
      localPublicacao: "Rio de Janeiro",
      editora: "ABNT",
      anoPublicacao: "2011",
    }),
        // gabarito literal NBR 6023:2025: 8.1.2 EXEMPLO 1 (p. 37)
    "ASSOCIAÇÃO BRASILEIRA DE NORMAS TÉCNICAS. ABNT NBR 14724: informação e documentação: trabalhos acadêmicos: apresentação. Rio de Janeiro: ABNT, 2011."
  );
});

// teste 10
test("coloca o órgão subordinado depois da instituição (8.1.2.2)", () => {
  assertLivro(
    livro({
      autores: [
        {
          tipo: "instituicao",
          nomeInstituicao: "Brasil",
          subordinacao: "Ministério da Justiça",
        },
      ],
      titulo: "Relatório de atividades",
      localPublicacao: "Brasília, DF",
      editora: "Ministério da Justiça",
      anoPublicacao: "1993",
    }),
        // gabarito literal NBR 6023:2025: 8.1.2.2 EXEMPLO 2 (p. 38)
    "BRASIL. Ministério da Justiça. Relatório de atividades. Brasília, DF: Ministério da Justiça, 1993."
  );

  assertLivro(
    livro({
      autores: [
        {
          tipo: "instituicao",
          nomeInstituicao: "São Paulo (Estado)",
          subordinacao: "Secretaria do Meio Ambiente",
        },
      ],
      titulo: "Diretrizes para a política ambiental do Estado de São Paulo",
      localPublicacao: "São Paulo",
      editora: "Secretaria do Meio Ambiente",
      anoPublicacao: "1993",
    }),
        // gabarito literal NBR 6023:2025: 8.1.2.2 EXEMPLO 1 (p. 38)
    "SÃO PAULO (Estado). Secretaria do Meio Ambiente. Diretrizes para a política ambiental do Estado de São Paulo. São Paulo: Secretaria do Meio Ambiente, 1993."
  );
});

// teste 11
test("preserva o conteúdo dos parênteses no nome institucional", () => {
  assertLivro(
    livro({
      autores: [
        {
          tipo: "instituicao",
          nomeInstituicao: "Biblioteca Nacional (Brasil)",
        },
      ],
      titulo: "Relatório da diretoria-geral: 1984",
      localPublicacao: "Rio de Janeiro",
      editora: "Biblioteca Nacional",
      anoPublicacao: "1985",
    }),
        // gabarito literal NBR 6023:2025: 8.1.2.5 EXEMPLO (p. 39)
    "BIBLIOTECA NACIONAL (Brasil). Relatório da diretoria-geral: 1984. Rio de Janeiro: Biblioteca Nacional, 1985."
  );
});

// teste 12
test("entra pelo título quando a autoria é desconhecida, sem negrito", () => {
  const result = assertLivro(
    livro({
      autoria: "desconhecida",
      autores: [],
      titulo: "Pequena biblioteca do vinho",
      localPublicacao: "São Paulo",
      editora: "Lafonte",
      anoPublicacao: "2012",
    }),
        // gabarito literal NBR 6023:2025: 8.1.4 EXEMPLO 1 (p. 39)
    "PEQUENA biblioteca do vinho. São Paulo: Lafonte, 2012."
  );

  assert.ok(result.segmentos.every((segmento) => segmento.destaque === "nenhum"));
});

// teste 13
test("maiusculiza artigo e palavra seguinte na entrada pelo título", () => {
  assertLivro(
    livro({
      autoria: "desconhecida",
      autores: [],
      titulo: "Os grandes clássicos das poesias líricas",
      localPublicacao: "[S. l.]",
      editora: "Ex Libris",
      anoPublicacao: "1981",
      numeracaoPaginas: { tipo: "folhas", valor: "60" },
    }),
        // gabarito literal NBR 6023:2025: 8.2.1 EXEMPLO (p. 40)
    "OS GRANDES clássicos das poesias líricas. [S. l.]: Ex Libris, 1981. 60 f."
  );
});

// teste 14
test("combina [S. l.] e [s. n.] em um único colchete", () => {
  assertLivro(
    livro({
      autores: [
        { tipo: "pessoa", nome: "F. B. Gonçalves" },
      ],
      titulo: "A história de Mirador",
      localPublicacao: "[S. l.]",
      editora: "[s. n.]",
      anoPublicacao: "1993",
    }),
        // gabarito literal NBR 6023:2025: 8.5.6 EXEMPLO (p. 43)
    "GONÇALVES, F. B. A história de Mirador. [S. l.: s. n.], 1993."
  );
});

// teste 15
test("normaliza a grafia dos valores sine loco e sine nomine", () => {
  assertLivro(
    livro({
      titulo: "A história de Mirador",
      localPublicacao: "[s. l.]",
      editora: "[S.N.]",
      anoPublicacao: "1993",
    }),
    "SILVA, Ana. A história de Mirador. [S. l.: s. n.], 1993."
  );
});

// teste 16
test("formata páginas, volumes e folhas", () => {
  const cases = [
    [
      { tipo: "paginas", valor: "326" },
      "SILVA, Ana. Introdução à pesquisa. Fortaleza: Editora Exemplo, 2025. 326 p.",
    ],
    [
      { tipo: "volumes", valor: "3" },
      "SILVA, Ana. Introdução à pesquisa. Fortaleza: Editora Exemplo, 2025. 3 v.",
    ],
    [
      { tipo: "folhas", valor: "157" },
      "SILVA, Ana. Introdução à pesquisa. Fortaleza: Editora Exemplo, 2025. 157 f.",
    ],
    [
      { tipo: "paginas", valor: "326 p." },
      "SILVA, Ana. Introdução à pesquisa. Fortaleza: Editora Exemplo, 2025. 326 p.",
    ],
    // Rótulo já no meio do valor é preservado, sem duplicar.
    [
      { tipo: "volumes", valor: "5 v. em 3" },
      "SILVA, Ana. Introdução à pesquisa. Fortaleza: Editora Exemplo, 2025. 5 v. em 3.",
    ],
    // Valor escrito com o rótulo antes do número não é reordenado nem duplicado.
    [
      { tipo: "paginas", valor: "p. 326" },
      "SILVA, Ana. Introdução à pesquisa. Fortaleza: Editora Exemplo, 2025. p. 326.",
    ],
  ];

  for (const [numeracaoPaginas, expected] of cases) {
    assertLivro(livro({ numeracaoPaginas }), expected);
  }
});

// teste 17
test("formata a descrição física do suporte", () => {
  const cases = [
    [
      { meio: "cdrom", quantidade: "5" },
      "SILVA, Ana. Introdução à pesquisa. Fortaleza: Editora Exemplo, 2025. 5 CD-ROM.",
    ],
    [
      { meio: "dvd", quantidade: "1" },
      "SILVA, Ana. Introdução à pesquisa. Fortaleza: Editora Exemplo, 2025. 1 DVD.",
    ],
    // 7.2.1: "GODINHO, Thais. ... 2014. E-book." — nunca com quantidade.
    [
      { meio: "ebook", quantidade: "1" },
      "SILVA, Ana. Introdução à pesquisa. Fortaleza: Editora Exemplo, 2025. E-book.",
    ],
    [
      { meio: "ebook", quantidade: "" },
      "SILVA, Ana. Introdução à pesquisa. Fortaleza: Editora Exemplo, 2025. E-book.",
    ],
    // Norma: "3 discos blu-ray" (plural) e "1 disco blu-ray".
    [
      { meio: "blu_ray", quantidade: "2" },
      "SILVA, Ana. Introdução à pesquisa. Fortaleza: Editora Exemplo, 2025. 2 discos blu-ray.",
    ],
    [
      { meio: "blu_ray", quantidade: "1" },
      "SILVA, Ana. Introdução à pesquisa. Fortaleza: Editora Exemplo, 2025. 1 disco blu-ray.",
    ],
    [
      { meio: "outro", outroMeio: "pen drive", quantidade: "2" },
      "SILVA, Ana. Introdução à pesquisa. Fortaleza: Editora Exemplo, 2025. 2 pen drive.",
    ],
    [
      { meio: "nenhum" },
      "SILVA, Ana. Introdução à pesquisa. Fortaleza: Editora Exemplo, 2025.",
    ],
  ];

  for (const [suporteFisico, expected] of cases) {
    assertLivro(livro({ suporteFisico }), expected);
  }
});

// teste 18
test("combina descrição física com o suporte eletrônico", () => {
  const cases = [
    // 7.2.1: "GODINHO, Thais. ... 2011. E-book (213 p.)."
    [
      { tipo: "paginas", valor: "213" },
      { meio: "ebook", quantidade: "1" },
      "SILVA, Ana. Introdução à pesquisa. Fortaleza: Editora Exemplo, 2025. E-book (213 p.).",
    ],
    // Exemplo da norma: "1 CD-ROM (p. 1-90)"
    [
      { tipo: "paginas", valor: "p. 1-90" },
      { meio: "cdrom", quantidade: "1" },
      "SILVA, Ana. Introdução à pesquisa. Fortaleza: Editora Exemplo, 2025. 1 CD-ROM (p. 1-90).",
    ],
    [
      { tipo: "volumes", valor: "3" },
      { meio: "dvd", quantidade: "3" },
      "SILVA, Ana. Introdução à pesquisa. Fortaleza: Editora Exemplo, 2025. 3 DVD (3 v.).",
    ],
  ];

  for (const [numeracaoPaginas, suporteFisico, expected] of cases) {
    assertLivro(livro({ numeracaoPaginas, suporteFisico }), expected);
  }
});

// teste 19
test("avisa quando o e-book traz quantidade, que é ignorada", () => {
  const result = assertLivro(
    livro({
      suporteFisico: { meio: "ebook", quantidade: "2" },
    }),
    "SILVA, Ana. Introdução à pesquisa. Fortaleza: Editora Exemplo, 2025. E-book."
  );

  assert.equal(result.avisos.length, 1);
  assert.equal(result.avisos[0].codigo, "EBOOK_QUANTIDADE_IGNORADA");
});

// teste 20
test("formata a série entre parênteses depois da descrição física", () => {
  assertLivro(
    livro({
      autores: [
        { tipo: "pessoa", nome: "Marlene Carvalho" },
      ],
      titulo: "Guia prático do alfabetizador",
      localPublicacao: "São Paulo",
      editora: "Ática",
      anoPublicacao: "1994",
      numeracaoPaginas: { tipo: "paginas", valor: "95" },
      serie: "Princípios, 243",
    }),
        // gabarito literal NBR 6023:2025: 8.10 EXEMPLO 2 (p. 50)
    "CARVALHO, Marlene. Guia prático do alfabetizador. São Paulo: Ática, 1994. 95 p. (Princípios, 243)."
  );
});

// teste 21
test("acrescenta nota ao final da referência", () => {
  assertLivro(
    livro({
      anoPublicacao: "2010",
      notas: "Edição comemorativa dos 50 anos de publicação.",
    }),
    "SILVA, Ana. Introdução à pesquisa. Fortaleza: Editora Exemplo, 2010. Edição comemorativa dos 50 anos de publicação."
  );
});

// teste 22
test("acrescenta endereço e data de acesso para livro online", () => {
  assertLivro(
    livro({
      anoPublicacao: "2011",
      online: true,
      url: "https://example.com/livro",
      dataAcesso: "2026-11-05",
    }),
    "SILVA, Ana. Introdução à pesquisa. Fortaleza: Editora Exemplo, 2011. Disponível em: https://example.com/livro. Acesso em: 5 nov. 2026."
  );
});

// teste 23
test("coloca a nota depois do acesso online", () => {
  assertLivro(
    livro({
      anoPublicacao: "2011",
      online: true,
      url: "https://example.com/livro",
      dataAcesso: "2026-11-05",
      notas: "Edição comemorativa.",
    }),
    "SILVA, Ana. Introdução à pesquisa. Fortaleza: Editora Exemplo, 2011. Disponível em: https://example.com/livro. Acesso em: 5 nov. 2026. Edição comemorativa."
  );
});

// teste 24
test("avisa quando o documento online está incompleto", () => {
  const result = assertLivro(
    livro({ online: true }),
    "SILVA, Ana. Introdução à pesquisa. Fortaleza: Editora Exemplo, 2025."
  );

  assert.equal(
    result.avisos.some((warning) => warning.codigo === "ONLINE_INCOMPLETO"),
    true
  );
});

// teste 25
test("imprime o ano de publicação como texto livre", () => {
  assertLivro(
    livro({ anoPublicacao: "[1969?]" }),
    "SILVA, Ana. Introdução à pesquisa. Fortaleza: Editora Exemplo, [1969?]."
  );
});

// teste 26
test("qualifica organizador, editor e compilador após o último autor", () => {
  assertLivro(
    livro({
      autores: [
        { tipo: "pessoa", nome: "Léslie Piccolotto Ferreira" },
      ],
      responsabilidade: "Organizador",
      titulo: "O fonoaudiólogo e a escola",
      localPublicacao: "São Paulo",
      editora: "Summus",
      anoPublicacao: "1991",
    }),
        // gabarito literal NBR 6023:2025: 8.1.1.4 EXEMPLO 1 (p. 36)
    "FERREIRA, Léslie Piccolotto (org.). O fonoaudiólogo e a escola. São Paulo: Summus, 1991."
  );

  assertLivro(
    livro({
      autores: [
        { tipo: "pessoa", nome: "André Koogan" },
      ],
      responsabilidade: "Editor",
      titulo: "Enciclopédia e dicionário digital 98",
      localPublicacao: "São Paulo",
      editora: "Delta",
      anoPublicacao: "1998",
      suporteFisico: { meio: "cdrom", quantidade: "5" },
    }),
    "KOOGAN, André (ed.). Enciclopédia e dicionário digital 98. São Paulo: Delta, 1998. 5 CD-ROM."
  );

  assertLivro(
    livro({
      autores: [
        { tipo: "pessoa", nome: "Roger Patron Lujan" },
      ],
      responsabilidade: "Compilador",
      titulo: "Um presente especial",
      outraResponsabilidade: "Tradução Sonia da Silva",
      edicao: "3",
      localPublicacao: "São Paulo",
      editora: "Aquariana",
      anoPublicacao: "1993",
      numeracaoPaginas: { tipo: "paginas", valor: "167" },
    }),
        // gabarito literal NBR 6023:2025: 8.1.1.4 EXEMPLO 3 (p. 36)
    "LUJAN, Roger Patron (comp.). Um presente especial. Tradução Sonia da Silva. 3. ed. São Paulo: Aquariana, 1993. 167 p."
  );
});

// teste 27
test("suprime a natureza jurídica da editora", () => {
  assertLivro(
    livro({
      editora: "Editora Atlas S.A.",
      anoPublicacao: "1995",
    }),
    "SILVA, Ana. Introdução à pesquisa. Fortaleza: Editora Atlas, 1995."
  );
});

// teste 28
test("ignora campos opcionais vazios", () => {
  assertLivro(
    livro({
      subtitulo: "",
      outraResponsabilidade: "",
      serie: "",
      edicao: "",
      notas: "",
      url: "",
      dataAcesso: "",
    }),
    "SILVA, Ana. Introdução à pesquisa. Fortaleza: Editora Exemplo, 2025."
  );
});

// teste 29
test("avisa quando autores são enviados com autoria desconhecida", () => {
  const result = assertLivro(
    livro({
      autoria: "desconhecida",
      autores: [{ tipo: "pessoa", nome: "Ana Silva" }],
      titulo: "Pequena biblioteca do vinho",
      localPublicacao: "São Paulo",
      editora: "Lafonte",
      anoPublicacao: "2012",
    }),
        // gabarito literal NBR 6023:2025: 8.1.4 EXEMPLO 1 (p. 39)
    "PEQUENA biblioteca do vinho. São Paulo: Lafonte, 2012."
  );

  assert.equal(
    result.avisos.some(
      (warning) => warning.codigo === "AUTORES_IGNORADOS_DESCONHECIDA"
    ),
    true
  );
});

// teste 30
test("avisa quando a responsabilidade não tem autor para qualificar", () => {
  const result = formatReferencia(
    livro({
      autoria: "desconhecida",
      autores: [],
      responsabilidade: "Organizador",
    })
  );

  assert.equal(
    result.avisos.some(
      (warning) => warning.codigo === "RESPONSABILIDADE_IGNORADA_DESCONHECIDA"
    ),
    true
  );
});

// teste 31
test("formata os meses conforme o Anexo A", () => {
  const expected = [
    "1 jan. 2026",
    "1 fev. 2026",
    "1 mar. 2026",
    "1 abr. 2026",
    "1 maio 2026",
    "1 jun. 2026",
    "1 jul. 2026",
    "1 ago. 2026",
    "1 set. 2026",
    "1 out. 2026",
    "1 nov. 2026",
    "1 dez. 2026",
  ];

  for (let month = 1; month <= 12; month += 1) {
    const isoDate = `2026-${String(month).padStart(2, "0")}-01`;
    assert.equal(formatDataAcesso(isoDate), expected[month - 1]);
  }
});

// teste 32
test("maiusculiza a entrada pelo título conforme o artigo inicial", () => {
  assert.equal(
    formatEntradaTitulo("Os grandes clássicos das poesias líricas"),
    "OS GRANDES clássicos das poesias líricas"
  );
  assert.equal(
    formatEntradaTitulo("Pequena biblioteca do vinho"),
    "PEQUENA biblioteca do vinho"
  );
  assert.equal(
    formatEntradaTitulo("A história de Mirador"),
    "A HISTÓRIA de Mirador"
  );
});

// teste 33
test("rejeita tipo de referência ainda não suportado", () => {
  assert.throws(
    () => formatReferencia({ tipo: "artigo" }),
    (error) =>
      error instanceof TipoDeReferenciaNaoSuportadoError &&
      error.code === "TIPO_DE_REFERENCIA_NAO_SUPORTADO" &&
      error.tipo === "artigo"
  );
});

// teste 34
test("devolve versões e perfil institucional", () => {
  const result = formatReferencia(livro());

  assert.equal(result.versaoNorma, "ABNT NBR 6023:2025");
  assert.equal(result.versaoFormatador, "0.2.0");
  assert.equal(result.perfilInstitucional, null);

  const withProfile = formatReferencia(livro(), {
    perfilInstitucional: "unifor",
  });

  assert.equal(withProfile.perfilInstitucional, "unifor");
});

// teste 35
test("aceita a saída normalizada do schema de livro", () => {
  const parsed = documentoLivroSchema.parse({
    tipo: "livro",
    autoria: "conhecida",
    quantidadeAutores: 1,
    autores: [{ tipo: "pessoa", nome: "Ana Silva" }],
    titulo: "Introdução à pesquisa",
    localPublicacao: "Fortaleza",
    editora: "Editora Exemplo",
    anoPublicacao: "2025",
  });

  const result = formatReferencia(parsed);

  assert.equal(
    result.textoPuro,
    "SILVA, Ana. Introdução à pesquisa. Fortaleza: Editora Exemplo, 2025."
  );
});

// teste 36
test("extrai o sobrenome do nome completo (8.1.1.3)", () => {
  const cases = [
    ["Eduardo Santos", "SANTOS, Eduardo"],
    ["Léslie Piccolotto Ferreira", "FERREIRA, Léslie Piccolotto"],
    // grau de parentesco: a parte final vai para o sobrenome
    ["Alexandre Assaf Neto", "ASSAF NETO, Alexandre"],
    ["Waldyr Grisard Filho", "GRISARD FILHO, Waldyr"],
    // prefixo de sobrenome hispânico
    ["Massimo La Torre", "LA TORRE, Massimo"],
    // hífen compõe uma única palavra
    ["Yves Saint-Arnaud", "SAINT-ARNAUD, Yves"],
    // apóstrofo também
    ["Ubiratan D'Ambrosio", "D'AMBROSIO, Ubiratan"],
    // partícula de prenome fica no prenome
    ["De Plácido e Silva", "SILVA, De Plácido e"],
    // nome único, sem prenome
    ["Madonna", "MADONNA"],
    // espaços duplos são colapsados
    ["Ana   Silva", "SILVA, Ana"],
  ];

  for (const [nome, expected] of cases) {
    assertLivro(
      livro({ autores: [{ tipo: "pessoa", nome }] }),
      `${expected}. Introdução à pesquisa. Fortaleza: Editora Exemplo, 2025.`
    );
  }
});

// teste 37
test("avisa quando autoria conhecida não tem autores", () => {
  const result = assertLivro(
    livro({ autoria: "conhecida", autores: [], quantidadeAutores: 1 }),
    "Introdução à pesquisa. Fortaleza: Editora Exemplo, 2025."
  );

  assert.equal(
    result.avisos.some((warning) => warning.codigo === "AUTORES_AUSENTES"),
    true
  );
});

// teste 38
test("maiusculiza fora de parênteses aninhados", () => {
  assert.equal(maiusculasForaDosParenteses("Foo (Bar (Baz))"), "FOO (Bar (Baz))");
  assert.equal(maiusculasForaDosParenteses("São Paulo (Estado)"), "SÃO PAULO (Estado)");
  assert.equal(
    maiusculasForaDosParenteses("Conselho (órgão (subórgão (subsub)))"),
    "CONSELHO (órgão (subórgão (subsub)))"
  );
});
