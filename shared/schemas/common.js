import { z } from "zod";

// Limites técnicos (não são regras da ABNT).
export const LIMITS = {
  title: 1000,
  authors: 50,
  url: 2048,
  name: 200,
  institutionName: 500,
  statement: 700,
  publicationYear: 30,
  responsibilities: 10,
  notes: 300,
  numbering: 100,
  physicalSupportDescription: 100,
  series: 200,
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
// Campo de subordinação segue a NBR 6023:2025, 8.1.2.2 (órgão superior).
const institutionAuthorSchema = z.strictObject({
  kind: z.literal("institution"),
  institutionName: z
    .string()
    .trim()
    .min(1, "Informe o nome da instituição.")
    .max(LIMITS.institutionName),
  subordination: z
    .string()
    .trim()
    .max(LIMITS.institutionName)
    .optional()
    .default(null),
});

export const authorSchema = z.discriminatedUnion("kind", [
  personAuthorSchema,
  institutionAuthorSchema,
]);

// Responsabilidade intelectual sobre a obra.
// Campo de escolha comum a vários tipos de documento. Default: "Autor da obra".
export const responsibilitySchema = z
  .enum(["Autor da obra", "Editor", "Organizador", "Compilador"])
  .default("Autor da obra");

// Indica se o usuário quer abreviar a lista de autores com "et al."
// quando houver 4 ou mais autores. Salvo para manter a referência
// exibida da mesma forma em futuras visualizações.
export const abbreviationSchema = z.boolean().default(false);

// Ano de publicação. Vários Documentos utilizam "Datas de publicação" mais completas do que somente Ano, futuramente serão adicionados.
export const publicationYearSchema = z
  .string()
  .trim()
  .min(1, "Informe o ano de publicação.")
  .max(LIMITS.publicationYear);

export const authorshipSchema = z.enum(["known", "unknown"]);

// Outro tipo de responsabilidade (tradução, ilustração, orientação...).
// NBR 6023:2025, 8.1.1.6 — aparece após o título.
// Permite apenas uma responsabilidade.
export const otherResponsibilitySchema = z
  .string()
  .trim()
  .max(LIMITS.statement)
  .optional()
  .default(null);

// Nota complementar ao final da referência
export const notesSchema = optionalField(
  z
    .string()
    .trim()
    .max(LIMITS.notes, `A nota deve ter no máximo ${LIMITS.notes} caracteres.`)
);

// Descrição física (8.7): número de páginas, volumes ou folhas.
// Campo opcional, sempre presente no formulário. Segue o modelo do MORE:
// seleção do tipo (dropdown, default "páginas") + valor livre.
export const pageNumberingSchema = z
  .strictObject({
    type: z.enum(["páginas", "volumes", "folhas"]),
    value: z.string().trim().min(1, "Informe o número.").max(LIMITS.numbering),
  })
  .optional()
  .default(null);

// Descrição física do suporte eletrônico (8.7.1 e 7.2.1).
// Exemplo normativo: "5 CD-ROM", "1 DVD", "1 e-book".
// Campo opcional, sempre presente no formulário. Default: "nenhum".
// Só um tipo de suporte por referência.
export const physicalSupportDescriptionSchema = z
  .strictObject({
    medium: z.enum([
      "nenhum",
      "cdrom",
      "dvd",
      "ebook",
      "blu_ray",
      "other",
    ]),
    otherMedium: z
      .string()
      .trim()
      .max(LIMITS.physicalSupportDescription)
      .optional()
      .default(null),
    quantity: z
      .string()
      .trim()
      .max(LIMITS.physicalSupportDescription)
      .optional()
      .default(null),
  })
  .optional()
  .default(null)
  .superRefine((data, ctx) => {
    if (!data) return;

    // Quando não é "nenhum", quantidade é obrigatória
    if (data.medium !== "nenhum" && (!data.quantity || data.quantity.trim() === "")) {
      ctx.addIssue({
        code: "custom",
        path: ["quantity"],
        message: "Informe a quantidade.",
      });
    }

    // Quando é "other", o texto livre é obrigatório
    if (data.medium === "other" && (!data.otherMedium || data.otherMedium.trim() === "")) {
      ctx.addIssue({
        code: "custom",
        path: ["otherMedium"],
        message: "Informe o tipo de suporte.",
      });
    }
  });

// Série (8.10).
// Campo opcional.
export const seriesSchema = z
  .string()
  .trim()
  .max(LIMITS.series, `A série deve ter no máximo ${LIMITS.series} caracteres.`)
  .optional()
  .default(null);
