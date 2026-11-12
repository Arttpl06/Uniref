import { z } from "zod";

// Limites técnicos (não são regras da ABNT).
export const LIMITES = {
  titulo: 1000,
  autores: 50,
  quantidadeAutores: 10,
  url: 2048,
  nomeCompleto: 300,
  nomeInstituicao: 500,
  outraResponsabilidade: 700,
  anoPublicacao: 30,
  responsabilidades: 10,
  notas: 300,
  numeracao: 100,
  suporteFisico: 100,
  serie: 200,
};

// Converte string vazia ("" ou espaços) em null antes da validação.
export function campoOpcional(schema) {
  return z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? null : value),
    schema.nullable().default(null)
  );
}

// Autor pessoal: nome completo em um único campo. O motor extrai o sobrenome
// (ver auxiliares.formatAutorPessoa) conforme a NBR 6023:2025, 8.1.1.
const autorPessoaSchema = z.strictObject({
  tipo: z.literal("pessoa"),
  nome: z
    .string()
    .trim()
    .min(1, "Informe o nome.")
    .max(LIMITES.nomeCompleto, `O nome deve ter no máximo ${LIMITES.nomeCompleto} caracteres.`),
});

// Autor institucional: nome da instituição e, opcionalmente, o órgão
// subordinado a ela (NBR 6023:2025, 8.1.2.2).
// nomeInstituicao é a entrada (órgão superior/jurisdição ou a própria
// instituição); subordinacao é o órgão subordinado.
const autorInstituicaoSchema = z.strictObject({
  tipo: z.literal("instituicao"),
  nomeInstituicao: z
    .string()
    .trim()
    .min(1, "Informe o nome da instituição.")
    .max(LIMITES.nomeInstituicao),
  subordinacao: campoOpcional(
    z.string().trim().max(LIMITES.nomeInstituicao)
  ),
});

export const autorSchema = z.discriminatedUnion("tipo", [
  autorPessoaSchema,
  autorInstituicaoSchema,
]);

// Responsabilidade intelectual sobre a obra.
// Campo de escolha comum a vários tipos de documento. Default: "Autor da Obra".
// Os valores espelham exatamente as opções do formulário do frontend.
export const responsabilidadeSchema = z
  .enum(["Autor da Obra", "Editor", "Organizador", "Compilador"])
  .default("Autor da Obra");

// Quantidade de autores informada pelo usuário no formulário (1 a 10).
// Referência principal para a abreviação com "et al." (NBR 6023:2025, 8.1.1.2):
// o motor decide por este número, não pelo tamanho da lista recebida.
// Obrigatório quando autoria = "conhecida"; omitida quando "desconhecida".
export const quantidadeAutoresSchema = z
  .number()
  .int()
  .min(1, "Informe a quantidade de autores.")
  .max(LIMITES.quantidadeAutores, `Máximo de ${LIMITES.quantidadeAutores} autores.`)
  .nullable()
  .default(null);

// Indica se o usuário quer abreviar a lista de autores com "et al."
// quando há 4 ou mais autores (quantidadeAutores). Salvo para manter a referência
// exibida da mesma forma em futuras visualizações.
export const abreviacaoSchema = z.boolean().default(false);

// Ano de publicação. Vários documentos utilizam "Datas de publicação" mais
// completas do que somente ano; futuramente serão adicionados campos próprios.
export const anoPublicacaoSchema = z
  .string()
  .trim()
  .min(1, "Informe o ano de publicação.")
  .max(LIMITES.anoPublicacao);

export const autoriaSchema = z.enum(["conhecida", "desconhecida"]);

// Outro tipo de responsabilidade (tradução, ilustração, orientação...).
// NBR 6023:2025, 8.1.1.6 — aparece após o título.
// Permite apenas uma responsabilidade.
export const outraResponsabilidadeSchema = campoOpcional(
  z.string().trim().max(LIMITES.outraResponsabilidade)
);

// Nota complementar ao final da referência
export const notasSchema = campoOpcional(
  z
    .string()
    .trim()
    .max(LIMITES.notas, `A nota deve ter no máximo ${LIMITES.notas} caracteres.`)
);

// Descrição física (8.7): número de páginas, volumes ou folhas.
// Campo opcional, sempre presente no formulário. Segue o modelo do formulário
// de livros: seleção do tipo (dropdown, default "paginas") + valor livre.
export const numeracaoPaginasSchema = z
  .strictObject({
    tipo: z.enum(["paginas", "volumes", "folhas"]),
    valor: z.string().trim().min(1, "Informe o número.").max(LIMITES.numeracao),
  })
  .optional()
  .default(null);

// URL do documento consultado online (6.6). Só aceita http/https:
// ftp, mailto:, javascript: e afins são rejeitados.
export const urlSchema = z.url({
  protocol: /^https?$/,
  message: "URL inválida (use http:// ou https://).",
});

// Descrição física do suporte eletrônico (8.7.1 e 7.2.1).
// Exemplos normativos: "5 CD-ROM", "1 DVD", "1 disco blu-ray", "E-book (213 p.)".
// Campo opcional, sempre presente no formulário. Default: null.
// Só um tipo de suporte por referência. E-book não leva quantidade
// (7.2.1: "GODINHO, Thais. ... 2014. E-book.").
export const suporteFisicoSchema = z
  .strictObject({
    meio: z.enum([
      "nenhum",
      "cdrom",
      "dvd",
      "ebook",
      "blu_ray",
      "outro",
    ]),
    outroMeio: z
      .string()
      .trim()
      .max(LIMITES.suporteFisico)
      .optional()
      .default(null),
    quantidade: z
      .string()
      .trim()
      .max(LIMITES.suporteFisico)
      .optional()
      .default(null),
  })
  .optional()
  .default(null)
  .superRefine((data, ctx) => {
    if (!data) return;

    // Quando não é "nenhum" nem "ebook", quantidade é obrigatória
    const exigeQuantidade = data.meio !== "nenhum" && data.meio !== "ebook";
    if (exigeQuantidade && (!data.quantidade || data.quantidade.trim() === "")) {
      ctx.addIssue({
        code: "custom",
        path: ["quantidade"],
        message: "Informe a quantidade.",
      });
    }

    // Quando é "outro", o texto livre é obrigatório
    if (data.meio === "outro" && (!data.outroMeio || data.outroMeio.trim() === "")) {
      ctx.addIssue({
        code: "custom",
        path: ["outroMeio"],
        message: "Informe o tipo de suporte.",
      });
    }
  });

// Série (8.10).
// Campo opcional.
export const serieSchema = campoOpcional(
  z
    .string()
    .trim()
    .max(LIMITES.serie, `A série deve ter no máximo ${LIMITES.serie} caracteres.`)
);
