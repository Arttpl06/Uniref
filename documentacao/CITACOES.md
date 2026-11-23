# Citações: especificação

## Escopo e distinção

Citação é a menção à fonte dentro do texto; referência identifica a fonte na lista bibliográfica. Ambas estão na entrega confirmada pelo grupo. Referências seguem a base NBR 6023:2025; citações usam NBR 10520:2023, fornecida no acervo.

Delimitação: sistema autor-data, citação indireta, chamada parentética — `(Silva, 2025)`. O motor monta a chamada; a paráfrase é escrita pelo usuário e não é gerada nem armazenada. Chamada narrativa, citação direta (curta e longa), localizador, sistema numérico, apud e sufixos a/b automáticos ficam fora desta entrega.

## Exemplo fictício

Fonte de Ana Silva publicada em 2025:

| Item | Saída |
|---|---|
| Chamada da citação indireta | (Silva, 2025) |

No texto, o usuário escreve a paráfrase e insere a chamada ao final: "A organização do acervo facilita a consulta (Silva, 2025)." A localização é opcional na citação indireta (7.2) e não é solicitada.

Para pessoa física, a chamada da NBR 10520:2023 usa maiúsculas e minúsculas, inclusive dentro dos parênteses. Não reutilizar o sobrenome convertido para caixa alta pelo formatador da referência. Preservar a grafia informada: não aplicar conversão ingênua a nomes compostos.

## Dados e comportamento

- Fonte: documento estruturado do contrato de referências. `referenciaId` fica reservado para a persistência; enquanto não houver tabela de referências, responde 422 `FONTE_NAO_SUPORTADA`.
- Abreviação: o campo `abreviacao` do próprio documento decide entre `et al.` e a lista completa, para não haver duas fontes de verdade.
- Sem trecho, localizador, página ou composição: a entrega devolve somente a chamada que o usuário insere no texto.
- Fonte e parâmetros inválidos devem produzir mensagens por campo, sem perder o formulário.

A norma distingue citações curtas de até três linhas e longas com mais de três linhas, mas essas modalidades exigem trecho e localizador e não fazem parte desta entrega. O sistema não infere modalidade pelo tamanho de texto.

## Arquitetura e algoritmo

Um motor geral da NBR 10520 e um extrator de metadados por tipo de documento. As regras de chamada (6.1.1 a 6.1.4) não dependem do tipo: ele só define de onde saem responsabilidade, data e título. `extrairFonteLivro` atende livro; novos tipos entram com um extrator novo e o núcleo permanece o mesmo. Tipo sem extrator responde 422 `FONTE_NAO_SUPORTADA`.

1. Validar a fonte e os metadados com o schema compartilhado.
2. Extrair as entradas de responsabilidade, o ano e o título — nunca fazer parsing de `textoPuro`.
3. Montar a chamada parentética conforme quantidade de autores, tipo de responsabilidade e ano.
4. Retornar chamada, segmentos, avisos e versões.

As funções de citação não dependem de HTTP ou banco. Compartilhar a extração de sobrenome com referências (`splitNomePessoa`), mas manter regras de apresentação distintas. Módulos: `modules/citations`, `domain/citations` e o schema em `shared/schemas/citacao.js`. O contrato HTTP está em API.md.

## Cobertura

| Caso | Evidência necessária |
|---|---|
| Um autor | Saída e caixa do sobrenome revisadas |
| Dois e três autores | Separador `;` entre as entradas |
| Quatro ou mais autores | `et al.` em itálico quando abreviado; lista completa quando não |
| Autor institucional | Nome ou sigla como digitado; subordinação ignorada |
| Autoria desconhecida | Entrada pelo título com `[...]` conforme 6.1.1.4 |
| Sobrenome composto | Assaf Neto, La Torre e Del Bianco preservados |
| Ano não convencional | `[1969?]` e `c1993` preservados |

Fora da cobertura: homônimos (6.1.5), mesmo autor e ano com a/b (6.1.6), vários documentos na mesma chamada (6.1.7 e 6.1.8), apud (7.3) e citação direta. A ausência de um gerenciador do trabalho completo impede garantir correspondência automática de sufixos autor/ano em toda a bibliografia.

## Aceite

Chamada conferida contra os exemplos da norma; nenhuma paráfrase inventada; demonstração integrada de referência e citação; prévia sem persistência. Persistência de trechos e histórico separado de citações ficam fora desta entrega.

Fontes locais: NBR 10520:2023, seções 6.1, 6.1.1 a 6.1.4, 7.2. Os exemplos deste documento são fictícios.
