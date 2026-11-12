import { z } from "zod";
import {
  autorSchema,
  autoriaSchema,
  anoPublicacaoSchema,
  outraResponsabilidadeSchema,
  notasSchema,
  responsabilidadeSchema,
  abreviacaoSchema,
  quantidadeAutoresSchema,
  numeracaoPaginasSchema,
  suporteFisicoSchema,
  serieSchema,
  campoOpcional,
  urlSchema,
  LIMITES,
} from "./common.js";

// Espelha o contrato do formulário de livros do frontend:
// - autoria "conhecida" -> quantidadeAutores 1..10 obrigatório;
// - abreviacao false    -> um nome por autor (autores.length === quantidadeAutores);
// - abreviacao true     -> só o primeiro nome é enviado, com quantidadeAutores >= 4
//   (o front esconde os demais campos);
// - autoria "desconhecida" -> sem autores e sem quantidadeAutores.
export const documentoLivroSchema = z
  .strictObject({
    tipo: z.literal("livro"),
    autoria: autoriaSchema,
    quantidadeAutores: quantidadeAutoresSchema,
    responsabilidade: responsabilidadeSchema,
    abreviacao: abreviacaoSchema,
    autores: z
      .array(autorSchema)
      .max(LIMITES.autores, `Máximo de ${LIMITES.autores} autores.`)
      .default([]),
    titulo: z
      .string()
      .trim()
      .min(1, "Informe o título.")
      .max(LIMITES.titulo, `O título deve ter no máximo ${LIMITES.titulo} caracteres.`),
    subtitulo: campoOpcional(z.string().trim().max(LIMITES.titulo)),
    outraResponsabilidade: outraResponsabilidadeSchema,
    serie: serieSchema,
    edicao: campoOpcional(z.string().trim().max(50)),
    localPublicacao: z
      .string()
      .trim()
      .min(1, "Informe o local de publicação. Use [S. l.] se não identificado.")
      .max(200),
    editora: z
      .string()
      .trim()
      .min(1, "Informe a editora. Use [s. n.] se não identificada.")
      .max(200),
    anoPublicacao: anoPublicacaoSchema,
    notas: notasSchema,
    online: z.boolean().default(false),
    url: campoOpcional(urlSchema.max(LIMITES.url)),
    dataAcesso: campoOpcional(
      z.iso.date({ error: "Data de acesso inválida (use AAAA-MM-DD)." })
    ),
    numeracaoPaginas: numeracaoPaginasSchema,
    suporteFisico: suporteFisicoSchema,
  })
  .superRefine((document, ctx) => {
    if (document.online && !document.url) {
      ctx.addIssue({
        code: "custom",
        path: ["url"],
        message: "URL é obrigatória quando online = true.",
      });
    }
    if (document.online && !document.dataAcesso) {
      ctx.addIssue({
        code: "custom",
        path: ["dataAcesso"],
        message: "Data de acesso é obrigatória quando online = true.",
      });
    }
    if (!document.online && (document.url || document.dataAcesso)) {
      ctx.addIssue({
        code: "custom",
        path: ["online"],
        message: "URL e data de acesso só valem quando online = true.",
      });
    }

    if (document.autoria === "desconhecida" && document.autores.length > 0) {
      ctx.addIssue({
        code: "custom",
        path: ["autores"],
        message: "Autoria desconhecida não deve ter autores.",
      });
    }
    if (document.autoria === "desconhecida" && document.quantidadeAutores !== null) {
      ctx.addIssue({
        code: "custom",
        path: ["quantidadeAutores"],
        message: "Autoria desconhecida não informa quantidade de autores.",
      });
    }

    if (document.autoria === "conhecida") {
      if (document.quantidadeAutores === null) {
        ctx.addIssue({
          code: "custom",
          path: ["quantidadeAutores"],
          message: "Informe a quantidade de autores.",
        });
      }
      if (document.autores.length === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["autores"],
          message: "Informe ao menos um autor quando autoria = conhecida.",
        });
      }
      // Abreviação escolhida no formulário: 4+ autores e apenas o primeiro nome.
      if (document.abreviacao) {
        if (
          document.quantidadeAutores !== null &&
          document.quantidadeAutores < 4
        ) {
          ctx.addIssue({
            code: "custom",
            path: ["abreviacao"],
            message:
              "A abreviação com et al. só se aplica a partir de 4 autores.",
          });
        }
        if (document.autores.length > 1) {
          ctx.addIssue({
            code: "custom",
            path: ["autores"],
            message:
              "Com a abreviação marcada, informe apenas o primeiro autor.",
          });
        }
      } else if (
        document.quantidadeAutores !== null &&
        document.autores.length !== document.quantidadeAutores
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["autores"],
          message: `A quantidade de autores é ${document.quantidadeAutores}, mas foram informados ${document.autores.length}.`,
        });
      }
    }

    // O formulário só permite autores de um mesmo tipo por referência
    // (pessoas ou instituições, nunca misturados).
    if (document.autores.length > 1) {
      const tipos = new Set(document.autores.map((autor) => autor.tipo));
      if (tipos.size > 1) {
        ctx.addIssue({
          code: "custom",
          path: ["autores"],
          message: "Não misture autores pessoa e instituição na mesma referência.",
        });
      }
    }
  });
