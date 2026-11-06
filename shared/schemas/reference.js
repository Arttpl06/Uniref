import { z } from "zod";
import { bookDocumentSchema } from "./book.js";

// Registro central: escolhe o schema pelo campo "type".
// Os demais tipos entram aqui quando forem implementados, por enquanto só há livro.
export const referenceDocumentSchema = z.discriminatedUnion("type", [
  bookDocumentSchema,
]);
