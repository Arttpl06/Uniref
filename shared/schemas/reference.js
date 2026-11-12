import { z } from "zod";
import { documentoLivroSchema } from "./livro.js";

// Registro central: escolhe o schema pelo campo "tipo".
// Os demais tipos entram aqui quando forem implementados, por enquanto só há livro.
export const documentoReferenciaSchema = z.discriminatedUnion("tipo", [
  documentoLivroSchema,
]);
