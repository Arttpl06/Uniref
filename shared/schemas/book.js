import { z } from "zod";
import {
  authorSchema,
  authorshipSchema,
  publicationYearSchema,
  otherResponsibilitySchema,
  notesSchema,
  responsibilitySchema,
  abbreviationSchema,
  pageNumberingSchema,
  physicalSupportDescriptionSchema,
  seriesSchema,
  optionalField,
  LIMITS,
} from "./common.js";

export const bookDocumentSchema = z
  .strictObject({
    type: z.literal("book"),
    authorship: authorshipSchema,
    responsibility: responsibilitySchema,
    abbreviation: abbreviationSchema,
    authors: z
      .array(authorSchema)
      .max(LIMITS.authors, `Máximo de ${LIMITS.authors} autores.`)
      .default([]),
    title: z
      .string()
      .trim()
      .min(1, "Informe o título.")
      .max(LIMITS.title, `O título deve ter no máximo ${LIMITS.title} caracteres.`),
    subtitle: optionalField(z.string().trim().max(LIMITS.title)),
    otherResponsibility: otherResponsibilitySchema,
    series: seriesSchema,
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
    notes: notesSchema,
    online: z.boolean().default(false),
    url: optionalField(z.url({ message: "URL inválida" }).max(LIMITS.url)),
    accessDate: optionalField(
      z.iso.date({ error: "Data de acesso inválida (use AAAA-MM-DD)." })
    ),
    pageNumbering: pageNumberingSchema,
    physicalSupportDescription: physicalSupportDescriptionSchema,
  })
  .superRefine((document, ctx) => {
    if (document.online && !document.url) {
      ctx.addIssue({
        code: "custom",
        path: ["url"],
        message: "URL é obrigatória quando online = true.",
      });
    }
    if (document.online && !document.accessDate) {
      ctx.addIssue({
        code: "custom",
        path: ["accessDate"],
        message: "Data de acesso é obrigatória quando online = true.",
      });
    }
    if (!document.online && (document.url || document.accessDate)) {
      ctx.addIssue({
        code: "custom",
        path: ["online"],
        message: "URL e data de acesso só valem quando online = true.",
      });
    }
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
