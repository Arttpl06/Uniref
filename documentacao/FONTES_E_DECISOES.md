# Fontes, decisões e pendências

Preparado em 29/09/2026. Fontes externas foram consultadas para sustentar escolhas técnicas; não representam homologação de um ambiente instalado.

## Material do grupo

- Gerador_de_Referencias_Bibliograficas.pdf, 10 páginas: objetivos, público, funcionalidades, fluxo e restrições tecnológicas.
- ABNT.zip: NBR 6023:2025, NBR 6023:2018, NBR 10520:2023, NBR 10520:2002 e guias de mudanças. O ZIP não contém aplicação ou repositório de código.
- Consultado o texto da NBR 6023:2025, especialmente sumário, regras gerais e indicação das seções dos tipos propostos. As referências de seção orientam a próxima etapa de homologação; não foi realizada auditoria integral de todos os casos da norma.

Os PDFs do acervo não são redistribuídos neste pacote de documentação. Manter fontes normativas em acesso autorizado para revisão do grupo.

## Fontes técnicas oficiais

- MORE: https://more.ufsc.br/inicio e https://more.ufsc.br/tutorial/norma — material público consultado declara NBR 6023:2018 e exemplifica fluxo de formulário, geração e coleção autenticada. Não inferir cobertura 2025 a partir desse resultado.
- Express: https://expressjs.com/ — framework HTTP para Node.js.
- Sequelize: https://sequelize.org/docs/v6/getting-started/ — linha v6 indicada como estável e uso de mysql2 para MySQL.
- Migrations: https://sequelize.org/docs/v6/other-topics/migrations/ — evolução versionada do banco.
- Prisma: https://www.prisma.io/docs/orm/v7 — alternativa avaliada; setup deve ser verificado por versão, sem assumir que tutorial antigo serve para release atual.
- Vite: https://vite.dev/guide/ e https://vite.dev/blog/announcing-vite8 — requisitos de ambiente e setup.
- Node: https://nodejs.org/pt/download — linha LTS considerada na proposta.
- Zod: https://zod.dev/ — schemas utilizáveis em JavaScript e integração com formulários.

Recomendações de organização de camadas, divisão de trabalho e metas de desempenho são decisões de engenharia desta proposta, não exigências dos sites consultados.

## Registro de decisões

| ID | Decisão | Consequência / alternativa |
|---|---|---|
| ADR01 | Monólito modular com REST | Um backend e um banco; microserviços não necessários |
| ADR02 | JavaScript nos dois lados | Atende restrição; TypeScript só se autorizado e desejado |
| ADR03 | Sequelize 6 com mysql2 | Migrations e models explícitos; Prisma permanece alternativa |
| ADR04 | Sessão no MySQL com cookie | Logout simples; requer CSRF e store persistente |
| ADR05 | Motor determinístico no backend | Resultado centralizado, testável e independente do frontend |
| ADR06 | Guardar entrada e resultado versionados | Edição possível e histórico estável após correções do motor |
| ADR07 | Quatro famílias no MVP | Escopo verificável; demais tipos entram por incremento |
| ADR08 | Geração pública, salvamento explícito | Menor barreira de uso; necessidade de rate limit |
| ADR09 | Campos comuns em colunas, específicos em JSON | Menos tabelas por subtipo; schemas e migrações de payload exigem disciplina |
| ADR10 | NBR 6023:2025 como base proposta | Perfil Unifor separado e pendente de manual |

## Perguntas a resolver na primeira reunião

1. Qual a data da entrega e a dedicação semanal de cada integrante?
2. O professor exige citações além de referências? Quais tipos e sistemas de chamada?
3. Qual manual e edição a Unifor adota para esse trabalho? Há divergências com a norma enviada?
4. Quem poderá revisar as saídas: professor, bibliotecário ou orientador?
5. O sistema será apenas demonstrado ou receberá usuários reais?
6. Qual orçamento e ambiente de hospedagem estão disponíveis?
7. Qual nome e licença o grupo adotará? “Aberta” no slide precisa ser traduzida em uma licença deliberada.

Essas pendências não impedem começar o fluxo de livro e a estrutura técnica, mas impedem prometer escopo normativo integral, adoção institucional e prazo fechado.
