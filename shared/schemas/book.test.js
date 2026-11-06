import test from "node:test";
import assert from "node:assert/strict";
import { bookDocumentSchema } from "./book.js";
import { LIMITS } from "./common.js";

// Base válida: cada teste muda só o que está sendo testado.
function bookMetadata(overrides = {}) {
  return {
    publicationPlace: "Fortaleza",
    publisher: "Editora Exemplo",
    publicationYear: "2025",
    ...overrides,
  };
}

function validBook(overrides = {}) {
  return {
    type: "book",
    authorship: "known",
    authors: [{ kind: "person", givenNames: "Ana", familyName: "Silva" }],
    title: "Introdução à pesquisa",
    metadata: bookMetadata(),
    ...overrides,
  };
}

test("aceita livro mínimo válido e aplica defaults", () => {
  const result = bookDocumentSchema.safeParse(validBook());

  assert.equal(result.success, true);
  assert.equal(result.data.metadata.online, false);
  assert.equal(result.data.metadata.url, null);
  assert.equal(result.data.metadata.subtitle, null);
});

test("aceita campos opcionais vazios e normaliza para null", () => {
  const result = bookDocumentSchema.safeParse(
    validBook({
      metadata: bookMetadata({
        subtitle: "",
        edition: "   ",
        url: "",
        accessDate: "",
      }),
    })
  );

  assert.equal(result.success, true);
  assert.equal(result.data.metadata.subtitle, null);
  assert.equal(result.data.metadata.edition, null);
  assert.equal(result.data.metadata.url, null);
  assert.equal(result.data.metadata.accessDate, null);
});

test("exige local de publicação", () => {
  const metadata = bookMetadata();
  delete metadata.publicationPlace;

  const result = bookDocumentSchema.safeParse(validBook({ metadata }));

  assert.equal(result.success, false);
});

test("rejeita local de publicação em branco", () => {
  const result = bookDocumentSchema.safeParse(
    validBook({ metadata: bookMetadata({ publicationPlace: "   " }) })
  );

  assert.equal(result.success, false);
});

test("exige editora", () => {
  const metadata = bookMetadata();
  delete metadata.publisher;

  const result = bookDocumentSchema.safeParse(validBook({ metadata }));

  assert.equal(result.success, false);
});

test("rejeita editora em branco", () => {
  const result = bookDocumentSchema.safeParse(
    validBook({ metadata: bookMetadata({ publisher: "" }) })
  );

  assert.equal(result.success, false);
});

test("aceita [S. l.] e [s. n.] quando local e editora não são identificados", () => {
  const result = bookDocumentSchema.safeParse(
    validBook({
      metadata: bookMetadata({
        publicationPlace: "[S. l.]",
        publisher: "[s. n.]",
      }),
    })
  );

  assert.equal(result.success, true);
});

test("rejeita título em branco", () => {
  const result = bookDocumentSchema.safeParse(validBook({ title: "   " }));

  assert.equal(result.success, false);
});

test("rejeita autor extra em branco quando o usuário pediu mais autores", () => {
  const result = bookDocumentSchema.safeParse(
    validBook({
      authors: [
        { kind: "person", givenNames: "Ana", familyName: "Silva" },
        { kind: "person", givenNames: "", familyName: "" },
      ],
    })
  );

  assert.equal(result.success, false);
});

test("rejeita online = true com URL e data de acesso em branco", () => {
  const result = bookDocumentSchema.safeParse(
    validBook({
      metadata: bookMetadata({
        online: true,
        url: "",
        accessDate: "",
      }),
    })
  );

  assert.equal(result.success, false);
});

test("rejeita título com mais de 1000 caracteres", () => {
  const result = bookDocumentSchema.safeParse(
    validBook({ title: "x".repeat(1001) })
  );

  assert.equal(result.success, false);
});

test("rejeita campo extra (userId)", () => {
  const result = bookDocumentSchema.safeParse(validBook({ userId: "abc" }));

  assert.equal(result.success, false);
});

test("rejeita online = true sem URL", () => {
  const result = bookDocumentSchema.safeParse(
    validBook({
      metadata: bookMetadata({
        online: true,
        accessDate: "2026-11-05",
      }),
    })
  );

  assert.equal(result.success, false);
});

test("rejeita autoria desconhecida com autores", () => {
  const result = bookDocumentSchema.safeParse(
    validBook({ authorship: "unknown" })
  );

  assert.equal(result.success, false);
});

test("rejeita autor pessoal sem sobrenome", () => {
  const result = bookDocumentSchema.safeParse(
    validBook({
      authors: [{ kind: "person", givenNames: "Ana" }],
    })
  );

  assert.equal(result.success, false);
});

test("aceita outras responsabilidades e nota, preservando a ordem", () => {
  const result = bookDocumentSchema.safeParse(
    validBook({
      otherResponsibilities: [
        { statement: "Tradução Vera da Costa e Silva" },
        { statement: "Ilustrações de Paulo Lyra" },
      ],
      notes: "Título original: Thinking Sociologically. Inclui bibliografia.",
    })
  );

  assert.equal(result.success, true);
  assert.deepEqual(
    result.data.otherResponsibilities.map((item) => item.statement),
    ["Tradução Vera da Costa e Silva", "Ilustrações de Paulo Lyra"]
  );
  assert.equal(
    result.data.notes,
    "Título original: Thinking Sociologically. Inclui bibliografia."
  );
});

test("aplica [] a responsabilidades e null a nota quando omitidas", () => {
  const result = bookDocumentSchema.safeParse(validBook());

  assert.equal(result.success, true);
  assert.deepEqual(result.data.otherResponsibilities, []);
  assert.equal(result.data.notes, null);
});

test("rejeita responsabilidade com texto vazio", () => {
  const result = bookDocumentSchema.safeParse(
    validBook({ otherResponsibilities: [{ statement: "   " }] })
  );

  assert.equal(result.success, false);
});

test("trata nota em branco como ausência de nota", () => {
  const result = bookDocumentSchema.safeParse(validBook({ notes: "   " }));

  assert.equal(result.success, true);
  assert.equal(result.data.notes, null);
});

test("rejeita nota acima do limite", () => {
  const result = bookDocumentSchema.safeParse(
    validBook({ notes: "a".repeat(LIMITS.notes + 1) })
  );

  assert.equal(result.success, false);
});

function onlineBook(accessDate) {
  return validBook({
    metadata: bookMetadata({
      online: true,
      url: "https://example.com/livro",
      accessDate,
    }),
  });
}

test("aceita data de acesso bissexta válida (2024-02-29)", () => {
  const result = bookDocumentSchema.safeParse(onlineBook("2024-02-29"));
  assert.equal(result.success, true);
});

test("rejeita data de acesso impossível (2026-02-30)", () => {
  const result = bookDocumentSchema.safeParse(onlineBook("2026-02-30"));
  assert.equal(result.success, false);
});

test("rejeita data de acesso impossível (2026-13-45)", () => {
  const result = bookDocumentSchema.safeParse(onlineBook("2026-13-45"));
  assert.equal(result.success, false);
});

test("authorship unknown dispensa a lista de autores", () => {
  const result = bookDocumentSchema.safeParse(
    validBook({ authorship: "unknown", authors: undefined })
  );

  assert.equal(result.success, true);
  assert.deepEqual(result.data.authors, []);
});

test("authorship known continua exigindo ao menos um autor", () => {
  const result = bookDocumentSchema.safeParse(
    validBook({ authors: undefined })
  );

  assert.equal(result.success, false);
});

test("aceita ano de publicação como texto livre", () => {
  for (const year of [
    "2025",
    "[1969?]",
    "[197-]",
    "[ca. 1960]",
    "[entre 1906 e 1912]",
  ]) {
    const result = bookDocumentSchema.safeParse(
      validBook({ metadata: bookMetadata({ publicationYear: year }) })
    );

    assert.equal(result.success, true, `deveria aceitar ${year}`);
  }
});

test("rejeita ano de publicação vazio", () => {
  const result = bookDocumentSchema.safeParse(
    validBook({ metadata: bookMetadata({ publicationYear: "   " }) })
  );

  assert.equal(result.success, false);
});

test("rejeita o formato antigo de data (objeto com kind)", () => {
  const result = bookDocumentSchema.safeParse(
    validBook({
      metadata: {
        ...bookMetadata(),
        publicationDate: { literal: "2025", kind: "exact" },
      },
    })
  );

  assert.equal(result.success, false);
});
