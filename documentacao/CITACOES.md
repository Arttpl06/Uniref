# Citações: especificação da entrega final

## Escopo e distinção

Citação é a menção à fonte dentro do texto; referência identifica a fonte na lista bibliográfica. Ambas estão na entrega final confirmada pelo grupo. Referências seguem a base NBR 6023:2025; citações usam NBR 10520:2023, fornecida no acervo.

Delimitação técnica proposta: sistema autor-data; chamada narrativa (autor no texto) e parentética (autor entre parênteses); citação indireta e direta curta/longa. Essa delimitação não significa suporte integral a todos os casos da norma. Sistema numérico, apud e geração automática de sufixos a/b a partir de uma bibliografia completa ficam fora da cobertura proposta.

## Exemplo fictício

Fonte de Ana Silva publicada em 2025:

| Modalidade | Saída ilustrativa |
|---|---|
| Indireta, narrativa | Silva (2025) |
| Indireta, parentética | (Silva, 2025) |
| Direta com página, narrativa | Silva (2025, p. 12) |
| Direta com página, parentética | (Silva, 2025, p. 12) |

Uma composição curta fictícia seria: “A organização facilita a consulta.” (Silva, 2025, p. 12). Pontuação final e casos de aspas internas precisam integrar o corpus de homologação antes da liberação.

Para pessoa física, a chamada da NBR 10520:2023 usa maiúsculas e minúsculas, inclusive dentro dos parênteses. Não reutilizar o sobrenome convertido para caixa alta pelo formatador da referência. Preservar grafia informada: não aplicar conversão ingênua a nomes compostos.

## Dados e comportamento

- Fonte: metadados preenchidos no gerador ou referência salva pertencente ao usuário.
- Modalidade: indireta, direta curta ou direta longa.
- Posição: narrativa ou parentética.
- Trecho: obrigatório na direta; opcional na indireta. A paráfrase deve vir do usuário, não ser produzida pelo sistema.
- Localizador: página ou outra localização disponível. Em direta, solicitar o localizador existente; para fonte sem localizador, exigir indicação explícita dessa condição e mostrar orientação. Nunca inventar página. Em indireta, localização é opcional.
- Fonte e parâmetros inválidos devem produzir mensagens por campo, sem perder o formulário.

A norma distingue citações curtas de até três linhas e longas com mais de três linhas no documento. O usuário escolhe a modalidade conforme o trabalho: não é possível inferi-la pelo número de caracteres ou pela largura da prévia no navegador.

A direta curta usa aspas; a longa usa bloco sem aspas externas, letra menor, espaço simples e recuo padronizado. A norma recomenda 4 cm de recuo. Mostrar essas orientações e uma prévia ilustrativa. A cópia em texto simples não preserva recuo, fonte ou espaçamento; avisar para conferir no editor de destino.

## Arquitetura e algoritmo

1. Resolver a fonte e validar propriedade se salva.
2. Validar opções e metadados; obter autores e data estruturados, nunca fazer parsing de plainText.
3. Selecionar regra de responsabilidade e data para chamada.
4. Montar chamada conforme posição e localizador.
5. Compor trecho opcional com marcação controlada conforme modalidade.
6. Retornar segmentos, chamada, composição, orientações, avisos e versões.

As funções de citação não dependem de HTTP ou banco. Compartilhar normalização de dados com referências, mas manter regras de apresentação distintas. Novos módulos: modules/citations, domain/citations e features/citations. O contrato HTTP está em API.md.

## Cobertura a homologar

| Caso | Evidência necessária |
|---|---|
| Um autor, narrativa/parentética | Saídas e caixa do sobrenome revisadas |
| Dois, três e mais autores | Separadores e uso consistente de abreviação conforme regra aprovada |
| Autor institucional | Forma de nome/sigla revisada |
| Autoria desconhecida | Entrada pelo título conforme regra específica |
| Direta curta e longa | Aspas, localizador, bloco e orientações |
| Indireta | Chamada sem apresentar paráfrase como transcrição literal |
| Fonte não paginada | Não inventar página; usar localização existente ou condição explícita |
| Homônimos e mesmo autor/ano | Aviso contextual; não inventar a/b ou alegar desambiguação automática |

Todos os casos estão planejados, ainda sem implementação ou homologação. Casos normativos sem suporte devem ser bloqueados ou marcados claramente para revisão. A ausência de um gerenciador do trabalho completo impede garantir correspondência automática de sufixos autor/ano em toda a bibliografia.

## Aceite

RF15 e RF19–22 atendidos; corpus normativo revisado; teste com referência de outro usuário rejeitado; cópia simples/rica/manual testada; nenhuma citação ou paráfrase inventada; demonstração integrada de referência e citação. Persistência de trechos e histórico separado de citações não são requisitos desta versão.

Fontes locais: NBR 10520:2023, seções 6.1, 7.1, 7.1.1 e 7.2. Os exemplos deste documento são fictícios.
