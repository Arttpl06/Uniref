import { formatarEntradaTitulo } from "./fonte.js";

// Monta a chamada parentética do sistema autor-data (6.1.3).
// Entrada: metadados extraídos da fonte; saída: texto e segmentos com destaque
// (apenas "et al." em itálico, conforme 6.1.2).
export function formatarChamada(fonte) {
  const ano = String(fonte.ano ?? "").trim();
  const segmentos = [];
  let textoEntrada = "";

  // 6.1.2: a abreviação é decidida por quantidadeAutores (campo do formulário),
  // não pelo tamanho da lista de autores recebida.
  const quantidade =
    Number.isInteger(fonte.quantidadeAutores) && fonte.quantidadeAutores > 0
      ? fonte.quantidadeAutores
      : fonte.entradas.length;

  if (fonte.entradas.length === 0) {
    // 6.1.1.4: entrada pelo título.
    textoEntrada = formatarEntradaTitulo(fonte.titulo);
    segmentos.push({ texto: textoEntrada, destaque: "nenhum" });
  } else {
    const abreviar = fonte.abreviacao === true && quantidade >= 4;

    if (abreviar) {
      // 6.1.2: primeiro autor seguido de et al. (itálico, expressão latina).
      segmentos.push({ texto: fonte.entradas[0].texto, destaque: "nenhum" });
      segmentos.push({ texto: " ", destaque: "nenhum" });
      segmentos.push({ texto: "et al.", destaque: "italico" });
      textoEntrada = `${fonte.entradas[0].texto} et al.`;
    } else {
      // Até 3 autores, ou 4+ sem abreviação: lista completa.
      for (let i = 0; i < fonte.entradas.length; i += 1) {
        if (i > 0) {
          segmentos.push({ texto: "; ", destaque: "nenhum" });
        }
        segmentos.push({
          texto: fonte.entradas[i].texto,
          destaque: "nenhum",
        });
      }
      textoEntrada = fonte.entradas.map((entrada) => entrada.texto).join("; ");
    }
  }

  // 6.1.3: entrada de responsabilidade acompanhada da data.
  const texto = `(${textoEntrada}, ${ano})`;

  segmentos.unshift({ texto: "(", destaque: "nenhum" });
  segmentos.push({ texto: ", ", destaque: "nenhum" });
  segmentos.push({ texto: ano, destaque: "nenhum" });
  segmentos.push({ texto: ")", destaque: "nenhum" });

  return { texto, segmentos };
}
