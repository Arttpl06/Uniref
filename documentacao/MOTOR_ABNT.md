# Motor de referências e cobertura normativa

## Responsabilidade

O motor transforma um documento estruturado em `{plainText, segments, warnings, standardVersion, formatterVersion, institutionalProfile}`. Deve ser determinístico: mesma entrada normalizada e mesma versão geram a mesma saída, sem consulta à internet, data atual implícita ou aleatoriedade.

Base de trabalho: NBR 6023:2025 fornecida no ZIP. Citações são outro produto, relacionado à NBR 10520:2023. As versões antigas no acervo servem para comparação, não devem ser misturadas com a versão escolhida. Guias secundários ajudam na interpretação, mas a decisão final deve ser conferida no texto normativo e homologada.

## Pipeline

1. Validar forma do JSON e limites técnicos.
2. Normalizar espaços externos e valores vazios; preservar grafia e acentos.
3. Validar consistência bibliográfica por tipo e classificar casos ainda sem suporte.
4. Selecionar formatter pelo par tipo/perfil.
5. Montar segmentos sem HTML: responsabilidade, título, publicação e acesso.
6. Aplicar pontuação entre elementos presentes, sem produzir separadores vazios.
7. Derivar texto simples dos segmentos e devolver avisos explícitos.

Um mapa de estratégias basta:

```js
// Exemplo conceitual: os formatadores ainda serão implementados.
const formatters = { book: formatBook, journalArticle: formatArticle,
  webPage: formatWebPage, academicWork: formatAcademicWork };

function formatReference(document, profile) {
  const format = formatters[document.type];
  if (!format) throw new UnsupportedReferenceTypeError(document.type);
  return format(document, profile);
}
```

Funções compartilhadas: formatAuthors, formatPublicationDate, formatAccessDate e joinSegments. Funções específicas decidem o destaque correto de cada tipo: o título do artigo e o título do periódico não têm a mesma função. Não aplicar negrito indistintamente a todos os títulos.

## Campos por família

“Exigido” abaixo significa entrada necessária para o caso comum implementado. A norma também prevê situações especiais, que precisam de representação e testes próprios; ausência legítima não equivale a erro de digitação.

| Família | Caso comum e campos | Condicionais / opções |
|---|---|---|
| Livro completo | Autoria declarada, título, local, editora, data de publicação | Subtítulo e edição quando constarem; online exige URL e acesso |
| Artigo de periódico | Autoria, título do artigo, título do periódico, local, data, localização no periódico | Volume/número conforme a fonte; páginas ou e-location conforme publicação; DOI quando existente; online exige URL e acesso |
| Página web | Responsabilidade quando identificada, título, identificação do site/fonte e data disponível | URL e acesso; local/editor quando pertinentes; ausência de autoria ou data segue regra específica homologada |
| Trabalho acadêmico | Autoria, título, ano de depósito, natureza (TCC/dissertação/tese), grau/curso, instituição, local e data de defesa/apresentação | Subtítulo, descrição física e dados complementares conforme perfil; online exige URL e acesso |

Datas de publicação devem permitir representação fiel ao documento. Proposta de modelo: `{literal, kind}`, com kind exact, approximate ou unknown. O MVP inicial pode aceitar apenas exact e bloquear os demais com explicação até homologação. Não transformar `unknown` em data inventada nem assumir automaticamente “s.d.”.

A interface deve mostrar os limites reais de cobertura. “Página web” é uma família simplificada: legislação, vídeo e artigo em uma URL não passam automaticamente a ser página web. Oferecer ajuda para escolher o tipo correto.

## Matriz de regras e aceite

| Código | Tema / referência ao material fornecido | Implementação planejada | Evidência necessária |
|---|---|---|---|
| AB01 | Ordem e pontuação — seção 6 | Composição por segmentos | Casos de cada tipo com e sem opcionais |
| AB02 | Livro — 7.1.1 e 7.2 | Estratégia book, incluindo acesso online | Exemplos independentes revisados |
| AB03 | Trabalho acadêmico — 7.1.2 e 7.2 | Estratégia academicWork | TCC, dissertação e tese |
| AB04 | Artigo — 7.7.5 e 7.7.6 | Estratégia journalArticle | Impresso/online, páginas/e-location |
| AB05 | Documento eletrônico — 7.20 e seção 6 | Estratégia webPage com cobertura delimitada | Página comum e instituição responsável |
| AB06 | Responsabilidade — 8.1 | Autores pessoais e institucionais, ordem preservada | 1, 2, 3 e mais autores; sobrenome composto |
| AB07 | Autoria desconhecida — 8.1.4 | Entrada pelo título conforme regra homologada | Título iniciado por artigo e sem artigo |
| AB08 | Datas — 8.6 | Representação exata e casos especiais explícitos | Data completa, ano e casos aproximados antes de liberá-los |
| AB09 | Destaque uniforme — 6.7 | Política fixa de negrito no perfil inicial, respeitando exceções | Comparar visualização e clipboard rico |
| AB10 | Endereço e acesso — 6.6 | URL e data de acesso nos tipos online | Validar data e protocolo sem fazer fetch |

Status de todas as linhas: **a implementar e homologar**. Esta matriz não constitui certificação e não esgota a norma. Criar novos casos para cada exceção encontrada. Os números das seções indicam onde revisar; não autorizam supor que um único template cobre toda a seção.

## Como construir o corpus

Criar fixtures com id, tipo, entrada, saída esperada, seção normativa, versão do perfil, responsável pela revisão e status. Preferir exemplos próprios e fictícios, escritos independentemente do algoritmo. Uma pessoa escreve a saída esperada; outra revisa a regra; só então o código é comparado.

Primeiro lote proposto: 6 casos de livro, 6 de artigo, 6 de página web, 6 de trabalho acadêmico e 12 casos transversais de autoria, datas, ausência de campos e pontuação. Ter 36 testes não demonstra cobertura total: registrar também os casos não suportados.

Nunca “corrigir” um teste apenas copiando a saída atual do programa. Não consultar MORE como única referência, pois seu material público consultado declara NBR 6023:2018.

## Versionamento e revisão

`standardVersion` identifica a edição normativa; `formatterVersion` identifica release do código; `schemaVersion` identifica formato dos metadados. Uma correção de bug muda o formatter mesmo sem nova edição da norma.

Ao atualizar o motor: adicionar teste que reproduz o problema; corrigir; executar corpus; revisar exemplos afetados; registrar changelog. Registros antigos continuam com o resultado salvo. Reformatar um registro deve ser uma ação explícita, mostrando a alteração ao usuário.

## Cópia e segurança

Texto simples perde negrito/itálico. Oferecer cópia rica com text/html e text/plain quando o navegador permitir; montar HTML só com texto escapado e tags controladas. Na falha, copiar texto e explicar a limitação. Não usar HTML arbitrário digitado pelo usuário nem dangerouslySetInnerHTML.

URL é metadado, não comando para o servidor acessar um site. Aceitar somente http/https e não buscar conteúdo remoto no MVP. Isso também evita introduzir coleta externa e riscos de requisições a endereços internos.
