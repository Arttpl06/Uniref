# Motor de referências e cobertura normativa

## Responsabilidade

O motor transforma um documento estruturado em `{textoPuro, segmentos, avisos, versaoNorma, versaoFormatador, perfilInstitucional}`. Deve ser determinístico: mesma entrada normalizada e mesma versão geram a mesma saída, sem consulta à internet, data atual implícita ou aleatoriedade.

Base de trabalho: NBR 6023:2025 fornecida no ZIP. Citações são uma funcionalidade obrigatória da mesma entrega, com motor próprio baseado na NBR 10520:2023 e contrato em CITACOES.md. As versões antigas no acervo servem para comparação, não devem ser misturadas com a versão escolhida. Guias secundários ajudam na interpretação, mas a decisão final deve ser conferida no texto normativo e homologada.

## Pipeline

1. Validar forma do JSON e limites técnicos.
2. Normalizar espaços externos e valores vazios; preservar grafia e acentos.
3. Validar consistência bibliográfica por tipo e classificar casos ainda sem suporte.
4. Selecionar formatter pelo par tipo/perfil.
5. Montar segmentos sem HTML: responsabilidade, título, publicação e acesso.
6. Aplicar pontuação entre elementos presentes, sem produzir separadores vazios.
7. Derivar texto simples dos segmentos e devolver avisos explícitos (`{codigo, campo, mensagem}`).

### Campos vazios

O formulário pode criar campos extras sob demanda (por exemplo, ao aumentar a quantidade de autores). A regra de validação é:

- **Campo opcional, visível e vazio** → não é erro. É normalizado para `null` (texto, URL, data de acesso, nota, subordinação, série, outra responsabilidade). Exemplo: subtítulo em branco, nota em branco etc.
- **Campo essencial vazio** → erro do schema (`min(1)`). Exemplo: título, ano de publicação, local e editora.
- **Campo vazio que contradiz outro valor** → erro do schema (`superRefine`). Exemplos: o usuário pediu 2 autores e só 1 nome foi enviado; `online = true` sem URL e data de acesso; `abreviacao = true` com menos de 4 autores.

Cada item de lista dinâmica precisa vir completo: um autor `person` exige o nome completo; um autor `institution` exige o nome da instituição.

## Estado da implementação

### Livro (implementado, aguardando homologação)

- Entrada validada por `shared/schemas/livro.js`.
- Motor em `backend/src/domain/formatters/`:
  - `index.js`: `formatReferencia(documento, perfil)` e erro para tipo não suportado (`TipoDeReferenciaNaoSuportadoError`).
  - `livro.js`: composição da referência de livro.
  - `helpers.js`: autores, datas, edição, publicação, descrição física, suporte, série, acesso e pontuação.
  - `version.js`: `versaoNorma` e `versaoFormatador`.
- Testes: `cd shared && node --test schemas/livro.test.js` (53 casos) e `cd backend && npm test` (38 casos do motor, arquivo `livro.formatador.test.js`, incluindo integração com o schema).
- Cobertura desta etapa: autoria pessoal e institucional, subordinação, autoria desconhecida, 1 a 4+ autores, `et al.`, qualificação de organizador/editor/compilador, título e subtítulo, outra responsabilidade, edição, local, editora, ano livre, páginas/volumes/folhas, suporte eletrônico com detalhe de páginas, série, nota, URL e data de acesso.
- Decisões de formatação:
  - Apenas o título recebe negrito; o subtítulo não.
  - Na entrada pelo título (autoria desconhecida), não há negrito; a primeira palavra (e o artigo inicial, quando houver) fica em maiúsculas.
  - Autor institucional (`tipo: "instituicao"`) com subordinação segue a NBR 6023:2025, 8.1.2.2: `INSTITUIÇÃO em caixa alta. Órgão subordinado em caixa normal`, como nos exemplos normativos `BRASIL. Ministério da Justiça.` e `SÃO PAULO (Estado). Secretaria do Meio Ambiente.`
  - `[S. l.]` e `[s. n.]` juntos viram `[S. l.: s. n.]`.
  - `et al.`: decidido por `quantidadeAutores` (campo do formulário), não pelo tamanho da lista enviada. Só é aplicado quando `abreviacao = true` e `quantidadeAutores ≥ 4`.
  - A natureza jurídica/comercial ao final da editora (`S.A.`, `Ltda.`, `ME`, `EPP`, `EIRELI`) é suprimida.
  - Nome pessoal em campo único (`nome`): o motor extrai o sobrenome e imprime `SOBRENOME, prenomes` (8.1.1). Regras, em ordem: final de parentesco (`Assaf Neto`, `Grisard Filho`), prefixo de sobrenome (`La Torre`, `Saint-Arnaud`), última palavra (`Eduardo Santos`). Nome único (“Madonna”) sai só em caixa alta. Limitação assumida: sobrenomes compostos que não seguem essas regras (ex.: `GARCÍA MÁRQUEZ`, `ESPÍRITO SANTO`) saem pelo último token; o cadastro fiel desses casos depende de dois campos ou de uma lista de exceções, e não foi implementado.
  - Descrição física (8.7.2): valor já com rótulo em qualquer posição é preservado sem duplicar (`326 p.`, `5 v. em 3`, `p. 1-90`); sem rótulo, ele é anexado (`326` → `326 p.`). O motor não reordena o que o usuário escreveu.
  - Suporte eletrônico (7.2.1, 8.7.1): rótulos normativos `CD-ROM`, `DVD`, `disco blu-ray`/`discos blu-ray` (plural na quantidade, como em `3 discos blu-ray (615 min)`); `E-book` nunca leva quantidade (`E-book.`, `E-book (213 p.).`). Quando há páginas/volumes/folhas e o suporte não é `nenhum`, a descrição física entra como detalhe entre parênteses: `1 CD-ROM (p. 1-90).`, `E-book (213 p.).`. Sem suporte eletrônico, a descrição fica como elemento próprio.
  - Avisos (`avisos`) existem para o motor usado sem o schema (API direta): `AUTORES_AUSENTES` (autoria conhecida sem autores → entrada pelo título), `ABREVIACAO_IGNORADA`, `EBOOK_QUANTIDADE_IGNORADA`, `ONLINE_INCOMPLETO`, `AUTORES_IGNORADOS_DESCONHECIDA`, `RESPONSABILIDADE_IGNORADA_DESCONHECIDA`.

Pendências conhecidas:

- A lista de artigos iniciais cobre português, inglês, espanhol, francês e italiano; outros idiomas precisam ser acrescentados.
- O motor não valida; ele recebe o documento já normalizado pelo schema.
- ISBN, dimensões, ilustrações e demais elementos complementares não estão no schema atual.

Um mapa de estratégias basta:

```js
// Implementado em backend/src/domain/formatters/index.js.
const formatters = { livro: formatLivro, artigoPeriodico: formatArtigo,
  paginaWeb: formatPaginaWeb, trabalhoAcademico: formatTrabalhoAcademico };

function formatReferencia(document, profile) {
  const format = formatters[document.tipo];
  if (!format) throw new TipoDeReferenciaNaoSuportadoError(document.tipo);
  return format(document, profile);
}'''
```

Funções compartilhadas: formatAutores, formatDataPublicacao, formatDataAcesso, joinSegmentos. Funções específicas decidem o destaque correto de cada tipo: o título do artigo e o título do periódico não têm a mesma função. Não aplicar negrito indistintamente a todos os títulos.

## Campos por família

“Exigido” abaixo significa entrada necessária para o caso comum implementado. A norma também prevê situações especiais, que precisam de representação e testes próprios; ausência legítima não equivale a erro de digitação.

| Família | Caso comum e campos | Condicionais / opções |
|---|---|---|
| Livro completo | Autoria declarada, título, local, editora, data de publicação | Subtítulo e edição quando constarem; online exige URL e acesso |
| Artigo de periódico | Autoria, título do artigo, título do periódico, local, data, localização no periódico | Volume/número conforme a fonte; páginas ou e-location conforme publicação; DOI quando existente; online exige URL e acesso |
| Página web | Responsabilidade quando identificada, título, identificação do site/fonte e data disponível | URL e acesso; local/editor quando pertinentes; ausência de autoria ou data segue regra específica homologada |
| Trabalho acadêmico | Autoria, título, ano de depósito, natureza (TCC/dissertação/tese), grau/curso, instituição, local e data de defesa/apresentação | Subtítulo, descrição física e dados complementares conforme perfil; online exige URL e acesso |

Local e editora são exigidos no livro (8.4 e 8.5). Quando não identificados, o valor obrigatório é a forma normativa: `[S. l.]` (sine loco) e `[s. n.]` (sine nomine). Se ambos faltarem, a norma pede a forma combinada `[S. l.: s. n.]` (8.5.6); o motor deve reconhecer esse par e imprimir conforme a norma.

Datas de publicação devem permitir representação fiel ao documento. Em livro, o ano é o único elemento (8.6.1) e é registrado como texto livre (`anoPublicacao`), aceitando as formas previstas em 8.6.1.3: `[1969?]`, `[197-]`, `[18--?]`, `[ca. 1960]`, `[entre 1906 e 1912]`, entre outras. O motor imprime o valor como veio, sem reinterpretar. Não usar `unknown`: quando o ano não é localizado, a norma exige um ano entre colchetes. Artigo de periódico pode acrescentar mês (8.6.2) e dia/hora (8.6.3) em campo próprio, sem reutilizar o campo de livro.

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

Status: AB02 (livro) implementado no motor e coberto por testes, aguardando homologação; as demais linhas continuam **a implementar e homologar**. Esta matriz não constitui certificação e não esgota a norma. Criar novos casos para cada exceção encontrada. Os números das seções indicam onde revisar; não autorizam supor que um único template cobre toda a seção.

## Como construir o corpus

Criar fixtures com id, tipo, entrada, saída esperada, seção normativa, versão do perfil, responsável pela revisão e status. Preferir exemplos próprios e fictícios, escritos independentemente do algoritmo. Uma pessoa escreve a saída esperada; outra revisa a regra; só então o código é comparado.

Primeiro lote proposto: 6 casos de livro, 6 de artigo, 6 de página web, 6 de trabalho acadêmico e 12 casos transversais de autoria, datas, ausência de campos e pontuação. Ter 36 testes não demonstra cobertura total: registrar também os casos não suportados.

Nunca “corrigir” um teste apenas copiando a saída atual do programa. Não consultar MORE como única referência, pois seu material público consultado declara NBR 6023:2018.

## Versionamento e revisão

`versaoNorma` identifica a edição normativa; `versaoFormatador` identifica release do código; `schemaVersion` identifica formato dos metadados. Uma correção de bug muda o formatador mesmo sem nova edição da norma.

Ao atualizar o motor: adicionar teste que reproduz o problema; corrigir; executar corpus; revisar exemplos afetados; registrar changelog. Registros antigos continuam com o resultado salvo. Reformatar um registro deve ser uma ação explícita, mostrando a alteração ao usuário.

## Cópia e segurança

Texto simples perde negrito/itálico. Oferecer cópia rica com text/html e text/plain quando o navegador permitir; montar HTML só com texto escapado e tags controladas. Na falha, copiar texto e explicar a limitação. Não usar HTML arbitrário digitado pelo usuário nem dangerouslySetInnerHTML.

URL é metadado, não comando para o servidor acessar um site. Aceitar somente http/https (`urlSchema`, `z.url({ protocol: /^https?$/ })`, em `shared/schemas/common.js`) e não buscar conteúdo remoto no escopo final. Isso também evita introduzir coleta externa e riscos de requisições a endereços internos.
