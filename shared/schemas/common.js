import { z } from "zod";

// Limites técnicos (não são regras da ABNT).
export const LIMITS = {
  title: 1000,
  authors: 50,
  url: 2048,
  name: 200,
  institutionName: 500,
  statement: 300,
  publicationYear: 30,
  responsibilities: 10,
  notes: 300,
};



export function optionalField(schema) {
  return z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? null : value),
    schema.nullable().default(null)
  );
}

// Autor pessoal: nome e sobrenome separados.
const personAuthorSchema = z.strictObject({
  kind: z.literal("person"),
  givenNames: z.string().trim().min(1, "Informe o nome.").max(LIMITS.name),
  familyName: z.string().trim().min(1, "Informe o sobrenome.").max(LIMITS.name),
});

// Autor institucional: apenas o nome da instituição.
const institutionAuthorSchema = z.strictObject({
  kind: z.literal("institution"),
  institutionName: z
    .string()
    .trim()
    .min(1, "Informe o nome da instituição.")
    .max(LIMITS.institutionName),
});

export const authorSchema = z.discriminatedUnion("kind", [
  personAuthorSchema,
  institutionAuthorSchema,
]);

// Ano de publicação. Vários Documentos utilizam "Datas de publicação" mais completas do que somente Ano, futuramente serão adicionados.
export const publicationYearSchema = z
  .string()
  .trim()
  .min(1, "Informe o ano de publicação.")
  .max(LIMITS.publicationYear);

export const authorshipSchema = z.enum(["known", "unknown"]);

// Outras responsabilidades (tradução, ilustração, orientação...).
export const otherResponsibilitySchema = z.strictObject({
  statement: z
    .string()
    .trim()
    .min(1, "Informe a responsabilidade.")
    .max(LIMITS.statement),
});

export const otherResponsibilitiesSchema = z
  .array(otherResponsibilitySchema)
  .max(LIMITS.responsibilities)
  .default([]);

// Nota complementar ao final da referência
export const notesSchema = optionalField(
  z
    .string()
    .trim()
    .max(LIMITS.notes, `A nota deve ter no máximo ${LIMITS.notes} caracteres.`)
);
