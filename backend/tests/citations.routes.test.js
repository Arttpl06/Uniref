import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import request from "supertest";
import citationsRoutes from "../src/modules/citations/routes.js";

const app = express();
app.use(express.json({ limit: "64kb" }));
app.use("/api/v1/citations", citationsRoutes);

const livroValido = {
  tipo: "livro",
  autoria: "conhecida",
  quantidadeAutores: 1,
  autores: [{ tipo: "pessoa", nome: "Ana Silva" }],
  titulo: "Introdução à pesquisa",
  localPublicacao: "Fortaleza",
  editora: "Editora Exemplo",
  anoPublicacao: "2025",
};

// teste 1
test("responde 200 com chamada parentética para documento válido", async () => {
  const response = await request(app)
    .post("/api/v1/citations/preview")
    .send({ fonte: { documento: livroValido } });

  assert.equal(response.status, 200);
  assert.equal(response.body.data.chamada.texto, "(Silva, 2025)");
  assert.equal(response.body.data.versaoNorma, "ABNT NBR 10520:2023");
});

// teste 2
test("responde 200 e abrevia conforme o campo abreviacao do documento", async () => {
  const response = await request(app)
    .post("/api/v1/citations/preview")
    .send({
      fonte: {
        documento: {
          ...livroValido,
          quantidadeAutores: 4,
          abreviacao: true,
          autores: [{ tipo: "pessoa", nome: "Maciel" }],
          anoPublicacao: "2019",
        },
      },
    });

  assert.equal(response.status, 200);
  assert.equal(response.body.data.chamada.texto, "(Maciel et al., 2019)");
});

// teste 3
test("responde 422 quando a fonte está ausente", async () => {
  const response = await request(app)
    .post("/api/v1/citations/preview")
    .send({});

  assert.equal(response.status, 422);
  assert.equal(response.body.error.code, "VALIDATION_ERROR");
  assert.ok(
    response.body.error.fields.some((field) => field.path === "fonte")
  );
});

// teste 4
test("responde 422 quando documento e referenciaId são enviados juntos", async () => {
  const response = await request(app)
    .post("/api/v1/citations/preview")
    .send({
      fonte: {
        documento: livroValido,
        referenciaId: "6f21cf49-b00a-438d-971d-1e9f6ba47b06",
      },
    });

  assert.equal(response.status, 422);
  assert.equal(response.body.error.code, "VALIDATION_ERROR");
});

// teste 5
test("responde 422 quando somente referenciaId é enviado (não suportado)", async () => {
  const response = await request(app)
    .post("/api/v1/citations/preview")
    .send({
      fonte: {
        referenciaId: "6f21cf49-b00a-438d-971d-1e9f6ba47b06",
      },
    });

  assert.equal(response.status, 422);
  assert.equal(response.body.error.code, "FONTE_NAO_SUPORTADA");
  assert.ok(
    response.body.error.fields.some((field) => field.path === "fonte")
  );
});

// teste 6
test("responde 422 quando o documento não passa no schema de referência", async () => {
  const response = await request(app)
    .post("/api/v1/citations/preview")
    .send({ fonte: { documento: { tipo: "livro", titulo: "Sem os demais campos" } } });

  assert.equal(response.status, 422);
  assert.equal(response.body.error.code, "VALIDATION_ERROR");
});

// teste 7
test("responde 422 quando o corpo tem campo extra (strict)", async () => {
  const response = await request(app)
    .post("/api/v1/citations/preview")
    .send({
      fonte: { documento: livroValido },
      campoInexistente: true,
    });

  assert.equal(response.status, 422);
  assert.equal(response.body.error.code, "VALIDATION_ERROR");
});
