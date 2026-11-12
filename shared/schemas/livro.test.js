import test from "node:test";
import assert from "node:assert/strict";
import { documentoLivroSchema } from "./livro.js";
import { LIMITES } from "./common.js";

// Base válida: cada teste muda só o que está sendo testado.
function dadosDePublicacao(overrides = {}) {
  return {
    localPublicacao: "Fortaleza",
    editora: "Editora Exemplo",
    anoPublicacao: "2025",
    ...overrides,
  };
}

function livroValido(overrides = {}) {
  return {
    tipo: "livro",
    autoria: "conhecida",
    quantidadeAutores: 1,
    autores: [{ tipo: "pessoa", nome: "Ana Silva" }],
    titulo: "Introdução à pesquisa",
    ...dadosDePublicacao(),
    ...overrides,
  };
}

// teste 1
test("aceita livro mínimo válido e aplica defaults", () => {
  const result = documentoLivroSchema.safeParse(livroValido());

  assert.equal(result.success, true);
  assert.equal(result.data.online, false);
  assert.equal(result.data.url, null);
  assert.equal(result.data.subtitulo, null);
});

// teste 2
test("aceita campos opcionais vazios e normaliza para null", () => {
  const result = documentoLivroSchema.safeParse(
    livroValido({
      subtitulo: "",
      edicao: "   ",
      url: "",
      dataAcesso: "",
    })
  );

  assert.equal(result.success, true);
  assert.equal(result.data.subtitulo, null);
  assert.equal(result.data.edicao, null);
  assert.equal(result.data.url, null);
  assert.equal(result.data.dataAcesso, null);
});

// teste 3
test("exige local de publicação", () => {
  const result = documentoLivroSchema.safeParse(
    livroValido({ localPublicacao: undefined })
  );

  assert.equal(result.success, false);
});

// teste 4
test("rejeita local de publicação em branco", () => {
  const result = documentoLivroSchema.safeParse(
    livroValido({ localPublicacao: "   " })
  );

  assert.equal(result.success, false);
});

// teste 5
test("exige editora", () => {
  const result = documentoLivroSchema.safeParse(
    livroValido({ editora: undefined })
  );

  assert.equal(result.success, false);
});

// teste 6
test("rejeita editora em branco", () => {
  const result = documentoLivroSchema.safeParse(
    livroValido({ editora: "" })
  );

  assert.equal(result.success, false);
});

// teste 7
test("aceita [S. l.] e [s. n.] quando local e editora não são identificados", () => {
  const result = documentoLivroSchema.safeParse(
    livroValido({
      localPublicacao: "[S. l.]",
      editora: "[s. n.]",
    })
  );

  assert.equal(result.success, true);
});

// teste 8
test("rejeita título em branco", () => {
  const result = documentoLivroSchema.safeParse(livroValido({ titulo: "   " }));

  assert.equal(result.success, false);
});

// teste 9
test("rejeita autor extra em branco quando o usuário pediu mais autores", () => {
  const result = documentoLivroSchema.safeParse(
    livroValido({
      quantidadeAutores: 2,
      autores: [
        { tipo: "pessoa", nome: "Ana Silva" },
        { tipo: "pessoa", nome: "   " },
      ],
    })
  );

  assert.equal(result.success, false);
});

// teste 10
test("rejeita online = true com URL e data de acesso em branco", () => {
  const result = documentoLivroSchema.safeParse(
    livroValido({
      online: true,
      url: "",
      dataAcesso: "",
    })
  );

  assert.equal(result.success, false);
});

// teste 11
test("rejeita título com mais de 1000 caracteres", () => {
  const result = documentoLivroSchema.safeParse(
    livroValido({ titulo: "x".repeat(1001) })
  );

  assert.equal(result.success, false);
});

// teste 12
test("rejeita campo extra (userId)", () => {
  const result = documentoLivroSchema.safeParse(livroValido({ userId: "abc" }));

  assert.equal(result.success, false);
});

// teste 13
test("rejeita online = true sem URL", () => {
  const result = documentoLivroSchema.safeParse(
    livroValido({
      online: true,
      dataAcesso: "2026-11-05",
    })
  );

  assert.equal(result.success, false);
});

// teste 14
test("rejeita autoria desconhecida com autores", () => {
  const result = documentoLivroSchema.safeParse(
    livroValido({ autoria: "desconhecida" })
  );

  assert.equal(result.success, false);
});

// teste 15
test("rejeita autor pessoal sem nome", () => {
  const result = documentoLivroSchema.safeParse(
    livroValido({
      autores: [{ tipo: "pessoa", nome: "   " }],
    })
  );

  assert.equal(result.success, false);
});

// teste 16
test("rejeita autor extra em branco quando a quantidade não confere", () => {
  const result = documentoLivroSchema.safeParse(
    livroValido({
      quantidadeAutores: 3,
      autores: [
        { tipo: "pessoa", nome: "Ana Silva" },
        { tipo: "pessoa", nome: "  " },
      ],
    })
  );

  assert.equal(result.success, false);
});

// teste 17
test("aceita todos os nomes quando a quantidade confere", () => {
  const result = documentoLivroSchema.safeParse(
    livroValido({
      quantidadeAutores: 3,
      autores: [
        { tipo: "pessoa", nome: "Ana Silva" },
        { tipo: "pessoa", nome: "Bruno Costa" },
        { tipo: "pessoa", nome: "Cássio Dias" },
      ],
    })
  );

  assert.equal(result.success, true);
});

// teste 18
test("aceita abreviação com 4 autores e apenas o primeiro nome", () => {
  const result = documentoLivroSchema.safeParse(
    livroValido({
      quantidadeAutores: 4,
      autores: [{ tipo: "pessoa", nome: "Robert Taylor" }],
      abreviacao: true,
    })
  );

  assert.equal(result.success, true);
  assert.equal(result.data.abreviacao, true);
});

// teste 19
test("rejeita abreviação com 4 nomes completos", () => {
  const result = documentoLivroSchema.safeParse(
    livroValido({
      quantidadeAutores: 4,
      autores: [
        { tipo: "pessoa", nome: "Robert Taylor" },
        { tipo: "pessoa", nome: "Denis Levine" },
        { tipo: "pessoa", nome: "Denis Marcellin-Little" },
        { tipo: "pessoa", nome: "Darryl Millis" },
      ],
      abreviacao: true,
    })
  );

  assert.equal(result.success, false);
});

// teste 20
test("rejeita abreviação com menos de 4 autores", () => {
  const result = documentoLivroSchema.safeParse(
    livroValido({ quantidadeAutores: 3, autores: [], abreviacao: true })
  );

  assert.equal(result.success, false);
});

// teste 21
test("rejeita autoria desconhecida com quantidade de autores", () => {
  const result = documentoLivroSchema.safeParse(
    livroValido({ autoria: "desconhecida", quantidadeAutores: 1 })
  );

  assert.equal(result.success, false);
});

// teste 22
test("rejeita misto de pessoas e instituições", () => {
  const result = documentoLivroSchema.safeParse(
    livroValido({
      quantidadeAutores: 2,
      autores: [
        { tipo: "pessoa", nome: "Ana Silva" },
        { tipo: "instituicao", nomeInstituicao: "Universidade de Fortaleza" },
      ],
    })
  );

  assert.equal(result.success, false);
});

// teste 23
test("aceita pessoas e instituições separadamente", () => {
  const institutions = documentoLivroSchema.safeParse(
    livroValido({
      quantidadeAutores: 2,
      autores: [
        { tipo: "instituicao", nomeInstituicao: "Brasil", subordinacao: "Ministério da Justiça" },
        { tipo: "instituicao", nomeInstituicao: "São Paulo (Estado)", subordinacao: "Secretaria do Meio Ambiente" },
      ],
    })
  );

  assert.equal(institutions.success, true);

  const persons = documentoLivroSchema.safeParse(
    livroValido({
      quantidadeAutores: 2,
      autores: [
        { tipo: "pessoa", nome: "Ana Silva" },
        { tipo: "pessoa", nome: "Bruno Costa" },
      ],
    })
  );

  assert.equal(persons.success, true);
});

// teste 24
test("trata subordinação, série e outra responsabilidade em branco como null", () => {
  const result = documentoLivroSchema.safeParse(
    livroValido({
      serie: "  ",
      outraResponsabilidade: "  ",
      autores: [
        { tipo: "instituicao", nomeInstituicao: "Brasil", subordinacao: "" },
      ],
      quantidadeAutores: 1,
    })
  );

  assert.equal(result.success, true);
  assert.equal(result.data.serie, null);
  assert.equal(result.data.outraResponsabilidade, null);
  assert.equal(result.data.autores[0].subordinacao, null);
});

// teste 25
test("aceita URL http e https", () => {
  for (const url of ["https://example.com/livro", "http://example.com/livro"]) {
    const result = documentoLivroSchema.safeParse(
      livroValido({ online: true, url, dataAcesso: "2026-11-05" })
    );

    assert.equal(result.success, true, `deveria aceitar ${url}`);
    assert.equal(result.data.online, true);
  }
});

// teste 26
test("rejeita URL ftp, mailto e javascript", () => {
  for (const url of [
    "ftp://example.com/livro",
    "mailto:contato@example.com",
    "javascript:alert(1)",
  ]) {
    const result = documentoLivroSchema.safeParse(
      livroValido({ online: true, url, dataAcesso: "2026-11-05" })
    );

    assert.equal(result.success, false, `deveria rejeitar ${url}`);
  }
});

// teste 27
test("aceita e-book sem quantidade", () => {
  const result = documentoLivroSchema.safeParse(
    livroValido({
      suporteFisico: { meio: "ebook" },
      numeracaoPaginas: { tipo: "paginas", valor: "213" },
    })
  );

  assert.equal(result.success, true);
  assert.equal(result.data.suporteFisico.quantidade, null);
});

// teste 28
test("aceita outra responsabilidade e nota", () => {
  const result = documentoLivroSchema.safeParse(
    livroValido({
      outraResponsabilidade: "Tradução Vera da Costa e Silva",
      notas: "Título original: Thinking Sociologically. Inclui bibliografia.",
    })
  );

  assert.equal(result.success, true);
  assert.equal(result.data.outraResponsabilidade, "Tradução Vera da Costa e Silva");
  assert.equal(
    result.data.notas,
    "Título original: Thinking Sociologically. Inclui bibliografia."
  );
});

// teste 29
test("aplica null a responsabilidade e nota quando omitidas", () => {
  const result = documentoLivroSchema.safeParse(livroValido());

  assert.equal(result.success, true);
  assert.equal(result.data.outraResponsabilidade, null);
  assert.equal(result.data.notas, null);
});

// teste 30
test("rejeita responsabilidade acima do limite", () => {
  const result = documentoLivroSchema.safeParse(
    livroValido({ outraResponsabilidade: "a".repeat(LIMITES.outraResponsabilidade + 1) })
  );

  assert.equal(result.success, false);
});

// teste 31
test("trata nota em branco como ausência de nota", () => {
  const result = documentoLivroSchema.safeParse(livroValido({ notas: "   " }));

  assert.equal(result.success, true);
  assert.equal(result.data.notas, null);
});

// teste 32
test("rejeita nota acima do limite", () => {
  const result = documentoLivroSchema.safeParse(
    livroValido({ notas: "a".repeat(LIMITES.notas + 1) })
  );

  assert.equal(result.success, false);
});

// teste 33
test("aceita série", () => {
  const result = documentoLivroSchema.safeParse(
    livroValido({ serie: "Vaga-lume, v. 12" })
  );

  assert.equal(result.success, true);
  assert.equal(result.data.serie, "Vaga-lume, v. 12");
});

// teste 34
test("rejeita série acima do limite", () => {
  const result = documentoLivroSchema.safeParse(
    livroValido({ serie: "a".repeat(LIMITES.serie + 1) })
  );

  assert.equal(result.success, false);
});

function onlineBook(dataAcesso) {
  return livroValido({
    online: true,
    url: "https://example.com/livro",
    dataAcesso,
  });
}

// teste 35
test("aceita data de acesso bissexta válida (2024-02-29)", () => {
  const result = documentoLivroSchema.safeParse(onlineBook("2024-02-29"));
  assert.equal(result.success, true);
});

// teste 36
test("rejeita data de acesso impossível (2026-02-30)", () => {
  const result = documentoLivroSchema.safeParse(onlineBook("2026-02-30"));
  assert.equal(result.success, false);
});

// teste 37
test("rejeita data de acesso impossível (2026-13-45)", () => {
  const result = documentoLivroSchema.safeParse(onlineBook("2026-13-45"));
  assert.equal(result.success, false);
});

// teste 38
test("autoria unknown dispensa a lista de autores", () => {
  const result = documentoLivroSchema.safeParse(
    livroValido({ autoria: "desconhecida", autores: undefined, quantidadeAutores: undefined })
  );

  assert.equal(result.success, true);
  assert.deepEqual(result.data.autores, []);
});

// teste 39
test("autoria known continua exigindo ao menos um autor", () => {
  const result = documentoLivroSchema.safeParse(
    livroValido({ autores: undefined })
  );

  assert.equal(result.success, false);
});

// teste 40
test("aceita ano de publicação como texto livre", () => {
  for (const ano of [
    "2025",
    "[1969?]",
    "[197-]",
    "[ca. 1960]",
    "[entre 1906 e 1912]",
  ]) {
    const result = documentoLivroSchema.safeParse(
      livroValido({ anoPublicacao: ano })
    );

    assert.equal(result.success, true, `deveria aceitar ${ano}`);
  }
});

// teste 41
test("rejeita ano de publicação vazio", () => {
  const result = documentoLivroSchema.safeParse(
    livroValido({ anoPublicacao: "   " })
  );

  assert.equal(result.success, false);
});

// teste 42
test("rejeita o formato antigo de data (objeto com tipo)", () => {
  const result = documentoLivroSchema.safeParse(
    livroValido({
      anoPublicacao: "2025",
      dataPublicacao: { literal: "2025", tipo: "exact" },
    })
  );

  assert.equal(result.success, false);
});

// teste 43
test("aceita descrição física com páginas", () => {
  const result = documentoLivroSchema.safeParse(
    livroValido({
      numeracaoPaginas: { tipo: "paginas", valor: "326" },
    })
  );

  assert.equal(result.success, true);
  assert.deepEqual(result.data.numeracaoPaginas, {
    tipo: "paginas",
    valor: "326",
  });
});

// teste 44
test("aceita descrição física com volumes", () => {
  const result = documentoLivroSchema.safeParse(
    livroValido({
      numeracaoPaginas: { tipo: "volumes", valor: "3" },
    })
  );

  assert.equal(result.success, true);
  assert.deepEqual(result.data.numeracaoPaginas, {
    tipo: "volumes",
    valor: "3",
  });
});

// teste 45
test("aceita descrição física com folhas", () => {
  const result = documentoLivroSchema.safeParse(
    livroValido({
      numeracaoPaginas: { tipo: "folhas", valor: "157" },
    })
  );

  assert.equal(result.success, true);
  assert.deepEqual(result.data.numeracaoPaginas, {
    tipo: "folhas",
    valor: "157",
  });
});

// teste 46
test("rejeita descrição física com valor vazio", () => {
  const result = documentoLivroSchema.safeParse(
    livroValido({
      numeracaoPaginas: { tipo: "paginas", valor: "   " },
    })
  );

  assert.equal(result.success, false);
});

// teste 47
test("aceita numeração omitida (null)", () => {
  const result = documentoLivroSchema.safeParse(livroValido());

  assert.equal(result.success, true);
  assert.equal(result.data.numeracaoPaginas, null);
});

// teste 48
test("aceita descrição física do suporte com CD-ROM", () => {
  const result = documentoLivroSchema.safeParse(
    livroValido({
      suporteFisico: {
        meio: "cdrom",
        quantidade: "5",
      },
    })
  );

  assert.equal(result.success, true);
  assert.deepEqual(result.data.suporteFisico, {
    meio: "cdrom",
    outroMeio: null,
    quantidade: "5",
  });
});

// teste 49
test("aceita descrição física do suporte com Outro e texto livre", () => {
  const result = documentoLivroSchema.safeParse(
    livroValido({
      suporteFisico: {
        meio: "outro",
        outroMeio: "Pen drive USB 3.0",
        quantidade: "2",
      },
    })
  );

  assert.equal(result.success, true);
  assert.deepEqual(result.data.suporteFisico, {
    meio: "outro",
    outroMeio: "Pen drive USB 3.0",
    quantidade: "2",
  });
});

// teste 50
test("aceita descrição física do suporte como Nenhum sem quantidade", () => {
  const result = documentoLivroSchema.safeParse(
    livroValido({
      suporteFisico: {
        meio: "nenhum",
      },
    })
  );

  assert.equal(result.success, true);
  assert.deepEqual(result.data.suporteFisico, {
    meio: "nenhum",
    outroMeio: null,
    quantidade: null,
  });
});

// teste 51
test("rejeita descrição física do suporte com CD-ROM sem quantidade", () => {
  const result = documentoLivroSchema.safeParse(
    livroValido({
      suporteFisico: {
        meio: "cdrom",
        quantidade: "",
      },
    })
  );

  assert.equal(result.success, false);
});

// teste 52
test("rejeita descrição física do suporte com Outro sem texto livre", () => {
  const result = documentoLivroSchema.safeParse(
    livroValido({
      suporteFisico: {
        meio: "outro",
        quantidade: "2",
      },
    })
  );

  assert.equal(result.success, false);
});

// teste 53
test("aceita descrição física do suporte omitida (null)", () => {
  const result = documentoLivroSchema.safeParse(livroValido());

  assert.equal(result.success, true);
  assert.equal(result.data.suporteFisico, null);
});
