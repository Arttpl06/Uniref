import { z } from "zod";
import { documentoReferenciaSchema } from "./reference.js";

// Entrada do motor de citações (NBR 10520:2023): a fonte é o documento
// estruturado do contrato de referências. A abreviação com "et al." vem
// do próprio documento (campo abreviacao), como no formulário de livros.
export const citacaoSchema = z.strictObject({
  fonte: z
    .strictObject({
      documento: documentoReferenciaSchema.optional(),
      referenciaId: z.uuid().optional(),
    })
    .superRefine((fonte, ctx) => {
      const temDocumento =
        typeof fonte.documento === "object" && fonte.documento !== null;
      const temReferenciaId =
        typeof fonte.referenciaId === "string" &&
        fonte.referenciaId.length > 0;

      if (!temDocumento && !temReferenciaId) {
        ctx.addIssue({
          code: "custom",
          path: ["fonte"],
          message:
            "Informe um documento bibliográfico ou o ID de uma referência salva.",
        });
      }
      if (temDocumento && temReferenciaId) {
        ctx.addIssue({
          code: "custom",
          path: ["fonte"],
          message:
            "Informe somente um dos dois: documento bibliográfico ou referência salva.",
        });
      }
    }),
});
