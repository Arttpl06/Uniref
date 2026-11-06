import { z } from "zod";
import {
  authorSchema,
  authorshipSchema,
  publicationYearSchema,
  otherResponsibilitiesSchema,
  notesSchema,
  optionalField,
  LIMITS,
} from "./common.js";

const bookMetadataSchema = z
  .strictObject({
    subtitle: optionalField(z.string().trim().max(LIMITS.title)),
    edition: optionalField(z.string().trim().max(50)),
    publicationPlace: z
      .string()
      .trim()
      .min(1, "Informe o local de publicação. Use [S. l.] se não identificado.")
      .max(200),
    publisher: z
      .string()
      .trim()
      .min(1, "Informe a editora. Use [s. n.] se não identificada.")
      .max(200),
    publicationYear: publicationYearSchema,
    online: z.boolean().default(false),
    url: optionalField(z.url({ message: "URL inválida" }).max(LIMITS.url)),
    accessDate: optionalField(
      z.iso.date({ error: "Data de acesso inválida (use AAAA-MM-DD)." })
    ),
  })
  .superRefine((metadata, ctx) => {
    if (metadata.online && !metadata.url) {
      ctx.addIssue({
        code: "custom",
        path: ["url"],
        message: "URL é obrigatória quando online = true.",
      });
    }
    if (metadata.online && !metadata.accessDate) {
      ctx.addIssue({
        code: "custom",
        path: ["accessDate"],
        message: "Data de acesso é obrigatória quando online = true.",
      });
    }
    if (!metadata.online && (metadata.url || metadata.accessDate)) {
      ctx.addIssue({
        code: "custom",
        path: ["online"],
        message: "URL e data de acesso só valem quando online = true.",
      });
    }
  });

export const bookDocumentSchema = z
  .strictObject({
    type: z.literal("book"),
    authorship: authorshipSchema,
    authors: z
      .array(authorSchema)
      .max(LIMITS.authors, `Máximo de ${LIMITS.authors} autores.`)
      .default([]),
    title: z
      .string()
      .trim()
      .min(1, "Informe o título.")
      .max(LIMITS.title, `O título deve ter no máximo ${LIMITS.title} caracteres.`),
    otherResponsibilities: otherResponsibilitiesSchema,
    notes: notesSchema,
    metadata: bookMetadataSchema,
  })
  .superRefine((document, ctx) => {
    if (document.authorship === "known" && document.authors.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["authors"],
        message: "Informe ao menos um autor quando authorship = known.",
      });
    }
    if (document.authorship === "unknown" && document.authors.length > 0) {
      ctx.addIssue({
        code: "custom",
        path: ["authors"],
        message: "Autoria desconhecida não deve ter autores.",
      });
    }
  });
