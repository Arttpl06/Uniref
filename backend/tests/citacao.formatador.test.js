import test from "node:test";
import assert from "node:assert/strict";
import {
  formatarCitacao,
  FonteNaoSuportadaError,
} from "../src/domain/citations/index.js";

// Base válida para os testes do formatador de citação. Cada teste muda só o necessário.
function citacao(overrides = {}) {
  return {
    tipo: "livro",
    autoria: "conhecida",
    quantidadeAutores: 1,
    abreviacao: false,
    autores: [{ tipo: "pessoa", nome: "Ana Silva" }],
    titulo: "Introdução à pesquisa",
    localPublicacao: "Fortaleza",
    editora: "Editora Exemplo",
    anoPublicacao: "2025",
    ...overrides,
  };
}

function assertCitacao(document, expected) {
  const result = formatarCitacao(document);

  assert.equal(result.chamada.texto, expected);
  assert.equal(
    result.chamada.segmentos.map((segmento) => segmento.texto).join(""),
    expected
  );

  for (const segmento of result.chamada.segmentos) {
    assert.ok(
      segmento.destaque === "nenhum" || segmento.destaque === "italico",
      `destaque inesperado: ${segmento.destaque}`
    );
  }

  return result;
}

// teste 1
test("uma autoria, chamada parentética (6.1.3)", () => {
  assertCitacao(
    citacao(),
    "(Silva, 2025)"
  );
});

// teste 2
test("duas autorias separadas por ponto e vírgula (6.1.3 EXEMPLO 1)", () => {
  assertCitacao(
    citacao({
      autores: [
        { tipo: "pessoa", nome: "Clarac" },
        { tipo: "pessoa", nome: "Bonnin" },
      ],
      quantidadeAutores: 2,
      anoPublicacao: "1985",
    }),
        // gabarito adaptado da NBR 10520:2023: 6.1.3 EXEMPLO 1 (p. 7), sem a página
    "(Clarac; Bonnin, 1985)"
  );
});

// teste 3
test("três autorias separadas por ponto e vírgula", () => {
  assertCitacao(
    citacao({
      autores: [
        { tipo: "pessoa", nome: "Cruz" },
        { tipo: "pessoa", nome: "Correa" },
        { tipo: "pessoa", nome: "Costa" },
      ],
      quantidadeAutores: 3,
      anoPublicacao: "1998",
    }),
        // gabarito literal da NBR 10520:2023: 6.1.8 EXEMPLO 3 (p. 9), sem a página
    "(Cruz; Correa; Costa, 1998)"
  );
});

// teste 4
test("quatro ou mais autorias com abreviação usa et al. itálico (6.1.2 EXEMPLO 1)", () => {
  const result = assertCitacao(
    citacao({
      autores: [{ tipo: "pessoa", nome: "Maciel" }],
      quantidadeAutores: 4,
      abreviacao: true,
      anoPublicacao: "2019",
    }),
        // gabarito literal da NBR 10520:2023: 6.1.8 EXEMPLO 3 (p. 9), sem a página
    "(Maciel et al., 2019)"
  );

  // A norma grafa a expressão latina em itálico (6.1.2).
  const etAl = result.chamada.segmentos.find(
    (segmento) => segmento.texto === "et al."
  );
  assert.equal(etAl.destaque, "italico");
});

// teste 5
test("quatro ou mais autorias sem abreviação lista todas (6.1.2 EXEMPLO 2)", () => {
  assertCitacao(
    citacao({
      autores: [
        { tipo: "pessoa", nome: "Maciel" },
        { tipo: "pessoa", nome: "Brum" },
        { tipo: "pessoa", nome: "Del Bianco" },
        { tipo: "pessoa", nome: "Costa" },
      ],
      quantidadeAutores: 4,
      abreviacao: false,
      anoPublicacao: "2019",
    }),
        // gabarito adaptado da NBR 10520:2023: 6.1.2 EXEMPLO 2 (p. 7), sem a página
    "(Maciel; Brum; Del Bianco; Costa, 2019)"
  );
});

// teste 6
test("sobrenome composto preserva a grafia (Assaf Neto)", () => {
  assertCitacao(
    citacao({
      autores: [{ tipo: "pessoa", nome: "Eduardo Assaf Neto" }],
    }),
        // mesma extração da NBR 6023:2025, 8.1.1.3 b
    "(Assaf Neto, 2025)"
  );
});

// teste 7
test("partícula de sobrenome preserva a grafia (La Torre)", () => {
  assertCitacao(
    citacao({
      autores: [{ tipo: "pessoa", nome: "Carlos La Torre" }],
      anoPublicacao: "2020",
    }),
        // mesma extração da NBR 6023:2025, 8.1.1.3 d
    "(La Torre, 2020)"
  );
});

// teste 8
test("sobrenome em maiúsculas e minúsculas, nunca caixa alta (6.1.1.1)", () => {
  assertCitacao(
    citacao({
      autores: [{ tipo: "pessoa", nome: "Ana da Silva" }],
    }),
        // respaldo: NBR 10520:2023, 5.1 EXEMPLO 1 (p. 2), referência SILVA, Antônio Augusto Moura da
    "(Silva, 2025)"
  );
});

// teste 9
test("pessoa jurídica pelo nome completo ou sigla (6.1.1.2)", () => {
  assertCitacao(
    citacao({
      autores: [
        { tipo: "instituicao", nomeInstituicao: "IBGE", subordinacao: null },
      ],
      anoPublicacao: "2011",
    }),
        // gabarito literal NBR 10520:2023: 6.1.1.2 EXEMPLO 2 (p. 5), sem a página
    "(IBGE, 2011)"
  );
});

// teste 10
test("instituição governamental ignora a subordinação (6.1.1.3)", () => {
  assertCitacao(
    citacao({
      autores: [
        {
          tipo: "instituicao",
          nomeInstituicao: "Brasil",
          subordinacao: "Ministério da Administração Federal e da Reforma do Estado",
        },
      ],
      anoPublicacao: "1995",
    }),
        // gabarito literal NBR 10520:2023: 6.1.1.3 (p. 5)
    "(Brasil, 1995)"
  );
});

// teste 11
test("autoria desconhecida, título de uma palavra (6.1.1.4 a)", () => {
  assertCitacao(
    citacao({
      autoria: "desconhecida",
      autores: [],
      quantidadeAutores: null,
      titulo: "Inglês",
      anoPublicacao: "2012",
    }),
        // gabarito literal NBR 10520:2023: 6.1.1.4 a) (p. 5), sem a página
    "(Inglês, 2012)"
  );
});

// teste 12
test("autoria desconhecida, título de mais de uma palavra com supressão (6.1.1.4 b)", () => {
  assertCitacao(
    citacao({
      autoria: "desconhecida",
      autores: [],
      quantidadeAutores: null,
      titulo: "Anteprojeto de lei",
      anoPublicacao: "1987",
    }),
        // gabarito literal NBR 10520:2023: 6.1.1.4 b) (p. 6), sem a página
    "(Anteprojeto [...], 1987)"
  );
});

// teste 13
test("autoria desconhecida, título iniciado por artigo (6.1.1.4 c)", () => {
  assertCitacao(
    citacao({
      autoria: "desconhecida",
      autores: [],
      quantidadeAutores: null,
      titulo: "A flor prometida",
      anoPublicacao: "1995",
    }),
        // gabarito literal NBR 10520:2023: 6.1.1.4 c) (p. 6), sem a página
    "(A flor [...], 1995)"
  );
});

// teste 14
test("autoria desconhecida, título iniciado por monossílabo (6.1.1.4 d)", () => {
  assertCitacao(
    citacao({
      autoria: "desconhecida",
      autores: [],
      quantidadeAutores: null,
      titulo: "Nos canaviais, mutilações em vez de lazer e escola",
      anoPublicacao: "1995",
    }),
        // gabarito literal NBR 10520:2023: 6.1.1.4 d) (p. 6), sem a página
    "(Nos canaviais [...], 1995)"
  );
});

// teste 15
test("ano de publicação como texto livre preservado ([1969?])", () => {
  assertCitacao(
    citacao({
      anoPublicacao: "[1969?]",
    }),
    "(Silva, [1969?])"
  );
});

// teste 16
test("ano de publicação como texto livre preservado (c1993)", () => {
  assertCitacao(
    citacao({
      anoPublicacao: "c1993",
    }),
    "(Silva, c1993)"
  );
});

// teste 17
test("segmentos recriam exatamente o texto da chamada (6.1.3 EXEMPLO 4)", () => {
  assertCitacao(
    citacao({
      autores: [
        { tipo: "pessoa", nome: "Jossua" },
        { tipo: "pessoa", nome: "Metz" },
      ],
      quantidadeAutores: 2,
      anoPublicacao: "1976",
    }),
        // gabarito literal NBR 10520:2023: 6.1.3 EXEMPLO 4 (p. 7)
    "(Jossua; Metz, 1976)"
  );
});

// teste 18
test("rejeita tipo de documento sem extrator de citação", () => {
  assert.throws(
    () => formatarCitacao({ tipo: "tipo_inexistente" }),
    FonteNaoSuportadaError
  );
});
