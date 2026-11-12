import {
  formatAutores,
  formatEdicao,
  formatOnline,
  formatNumeracaoPaginas,
  formatSuporteFisico,
  formatPublicacao,
  formatSerie,
  formatEntradaTitulo,
  joinSegmentos,
  comPonto,
} from "./helpers.js";
import { VERSAO_FORMATADOR, VERSAO_NORMA } from "./version.js";

// Formata um livro segundo a NBR 6023:2025.
// Ordem dos elementos: responsabilidade, título/subtítulo, outras
// responsabilidades, edição, publicação, descrição física (ou suporte com o
// detalhe entre parênteses), série, acesso e notas.
export function formatLivro(documento, perfil = {}) {
  const avisos = [];
  const elementos = [];

  if (documento.online && (!documento.url || !documento.dataAcesso)) {
    avisos.push({
      codigo: "ONLINE_INCOMPLETO",
      campo: "online",
      mensagem: "Para documento online, informe URL e data de acesso.",
    });
  }

  if (documento.autoria === "conhecida") {
    const autores = formatAutores(documento, avisos);
    if (autores) {
      elementos.push([{ texto: autores, destaque: "nenhum" }]);
    }
  } else if (Array.isArray(documento.autores) && documento.autores.length > 0) {
    avisos.push({
      codigo: "AUTORES_IGNORADOS_DESCONHECIDA",
      campo: "autores",
      mensagem:
        "Com autoria desconhecida, a entrada é pelo título e os autores são ignorados.",
    });
  }

  if (
    documento.autoria === "desconhecida" &&
    documento.responsabilidade &&
    documento.responsabilidade !== "Autor da Obra"
  ) {
    avisos.push({
      codigo: "RESPONSABILIDADE_IGNORADA_DESCONHECIDA",
      campo: "responsabilidade",
      mensagem:
        "Com autoria desconhecida, não há nome de responsável para receber a qualificação.",
    });
  }

  if (
    documento.suporteFisico?.meio === "ebook" &&
    documento.suporteFisico.quantidade
  ) {
    avisos.push({
      codigo: "EBOOK_QUANTIDADE_IGNORADA",
      campo: "suporteFisico",
      mensagem: 'E-book não leva quantidade: a norma prevê apenas "E-book".',
    });
  }

  elementos.push(formatTitulo(documento));

  if (documento.outraResponsabilidade) {
    elementos.push([
      { texto: comPonto(documento.outraResponsabilidade), destaque: "nenhum" },
    ]);
  }

  const edicao = formatEdicao(documento.edicao);
  if (edicao) {
    elementos.push([{ texto: edicao, destaque: "nenhum" }]);
  }

  const publicacao = formatPublicacao(documento);
  if (publicacao) {
    elementos.push([{ texto: publicacao, destaque: "nenhum" }]);
  }

  const suporte = documento.suporteFisico;
  // Com suporte eletrônico, a descrição física entra como detalhe entre
  // parênteses (7.2.1); sem suporte, ela fica como elemento próprio (8.7.2).
  if (!suporte || suporte.meio === "nenhum") {
    const numeracaoPaginas = formatNumeracaoPaginas(documento.numeracaoPaginas);
    if (numeracaoPaginas) {
      elementos.push([{ texto: numeracaoPaginas, destaque: "nenhum" }]);
    }
  }

  const suporteFisico = formatSuporteFisico(suporte, documento.numeracaoPaginas);
  if (suporteFisico) {
    elementos.push([{ texto: suporteFisico, destaque: "nenhum" }]);
  }

  const serie = formatSerie(documento.serie);
  if (serie) {
    elementos.push([{ texto: serie, destaque: "nenhum" }]);
  }

  const online = formatOnline(documento);
  if (online) {
    elementos.push([{ texto: online, destaque: "nenhum" }]);
  }

  if (documento.notas) {
    elementos.push([{ texto: comPonto(documento.notas), destaque: "nenhum" }]);
  }

  const segmentos = joinSegmentos(elementos);

  return {
    textoPuro: segmentos.map((segmento) => segmento.texto).join(""),
    segmentos,
    avisos,
    versaoNorma: VERSAO_NORMA,
    versaoFormatador: VERSAO_FORMATADOR,
    perfilInstitucional: perfil?.perfilInstitucional ?? null,
  };
}

// O título é o único elemento com destaque tipográfico quando há autoria.
// 6.7: na entrada pelo título (autoria desconhecida), não se aplica negrito,
// pois o destaque já é feito pelas letras maiúsculas iniciais.
function formatTitulo(documento) {
  const titulo = documento.titulo;
  const subtitulo = documento.subtitulo;

  if (documento.autoria === "desconhecida") {
    const entrada = formatEntradaTitulo(titulo);
    const text = subtitulo ? `${entrada}: ${subtitulo}` : entrada;
    return [{ texto: comPonto(text), destaque: "nenhum" }];
  }

  const segmentos = [{ texto: titulo, destaque: "negrito" }];
  const tail = subtitulo ? `: ${subtitulo}` : "";

  if (tail) {
    segmentos.push({ texto: tail, destaque: "nenhum" });
    if (!/[.!?]$/.test(tail)) {
      segmentos.push({ texto: ".", destaque: "nenhum" });
    }
  } else if (!/[.!?]$/.test(titulo)) {
    segmentos.push({ texto: ".", destaque: "nenhum" });
  }

  return segmentos;
}
