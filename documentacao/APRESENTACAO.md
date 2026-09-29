# Resumo para apresentação do projeto

## Proposta

Desenvolver uma aplicação web que transforme dados de fontes acadêmicas em referências bibliográficas, com preenchimento guiado, cópia e histórico pessoal. A experiência terá inspiração no MORE da UFSC, com implementação própria e cobertura normativa explicitamente documentada.

## Problema e público

Estudantes, professores e pesquisadores gastam tempo organizando referências e podem cometer erros de formatação. A ferramenta pretende reduzir esse trabalho e facilitar a revisão. O projeto será demonstrado na última aula da disciplina com dados fictícios, sem uso público real. Não aplicaremos um padrão institucional específico nesta etapa.

## Requisitos principais da entrega final

1. Cadastrar, autenticar e encerrar a sessão do usuário.
2. Selecionar livro, artigo de periódico, página web ou trabalho acadêmico.
3. Preencher e validar os campos específicos da fonte.
4. Gerar uma referência e identificar o perfil normativo utilizado.
5. Copiar o resultado, explicando limitações de formatação da cópia simples.
6. Salvar referências na conta e consultar o histórico privado.
7. Editar e excluir as próprias referências.
8. Utilizar a interface em português, em celular e desktop, com navegação por teclado.
9. Gerar e copiar citações diretas e indiretas com base nos dados da fonte, segundo a NBR 10520:2023.

## Tecnologias escolhidas

| Parte | Escolha |
|---|---|
| Interface | React + Vite + CSS Modules |
| Formulários e navegação | React Hook Form, Zod e React Router |
| API | Node.js + Express, em JavaScript |
| ORM e driver | Sequelize + mysql2 |
| Banco | MySQL |
| Testes | Vitest, Testing Library e Supertest |

## Como funciona

O usuário seleciona o tipo e preenche os dados. O React envia esses dados para a API. O backend valida, escolhe o formatador daquele tipo e devolve texto e destaques. A geração pode ser feita sem conta; para salvar, o usuário entra na sua conta. O MySQL guarda os metadados, o resultado e a versão da regra usada.

## Arquitetura e justificativa

Adotaremos um monólito modular: uma API organizada em rotas, controllers, services e repositories. O motor de formatação ficará separado do HTTP e do banco. Essa divisão permite testar regras bibliográficas isoladamente e adicionar novos tipos sem reescrever toda a aplicação.

Sequelize foi escolhido por permitir modelagem e migrações em JavaScript com MySQL. A decisão prioriza a restrição da disciplina e uma estrutura que o grupo consiga explicar e manter.

## Qualidade e limites

A base proposta é a NBR 6023:2025 enviada no acervo. Cada tipo será validado com exemplos revisados. A ferramenta formata os dados informados, mas não verifica automaticamente a existência da fonte. Não vamos declarar cobertura integral da norma nem aprovação institucional sem evidência.

Citações no texto fazem parte da entrega final. A delimitação técnica proposta é o sistema autor-data, com modalidades direta curta, direta longa e indireta. Exportação de arquivos, coleções e importação por DOI/ISBN ficam fora do escopo.

## Demonstração planejada

Mostrar um livro fictício, gerar e copiar a referência e uma citação indireta; compor uma citação direta com trecho fictício e página. Entrar na conta, salvar a referência, consultar e editar o registro. Depois demonstrar um campo inválido e que outro usuário não acessa o histórico. Mostrar matriz de testes e limitações conhecidas.

## Indicadores propostos

Pelo menos 4 de 5 participantes concluem gerar/copiar em até 2 minutos com dados disponíveis. Todos os exemplos normativos homologados passam nos testes. Nenhuma operação de histórico permite acesso cruzado entre contas. São metas a medir, não resultados já obtidos.
