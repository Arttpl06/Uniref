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
| ADR07 | Quatro famílias no escopo final | Escopo verificável; ampliação de tipos suspensa |
| ADR08 | Geração pública, salvamento explícito | Menor barreira de uso; necessidade de rate limit |
| ADR09 | Campos comuns em colunas, específicos em JSON | Menos tabelas por subtipo; schemas e migrações de payload exigem disciplina |
| ADR10 | NBR 6023:2025 para referências; NBR 10520:2023 para citações | Padrão específico da Unifor fora do escopo atual |

## Perguntas a resolver na primeira reunião

1. Qual a data da entrega e a dedicação semanal de cada integrante?
2. Revisar a delimitação técnica proposta: autor-data, diretas curtas/longas e indiretas. A inclusão de citações já está confirmada.
3. Conferir exemplos de referência e citação contra as normas enviadas; manual da Unifor fica fora do escopo atual.
4. Quem poderá revisar as saídas: professor, bibliotecário ou orientador?
5. Definir ambiente da demonstração: local ou hospedado. Não haverá usuários reais.
6. Qual orçamento e ambiente de hospedagem estão disponíveis?
7. Qual nome e licença o grupo adotará? “Aberta” no slide precisa ser traduzida em uma licença deliberada.

O grupo confirmou entrega única completa na última aula, incluindo citações, com uso exclusivo para demonstração. Ampliação de tipos e padrão institucional estão suspensos. Permanecem a homologação das saídas e a organização do calendário.

## Decisões confirmadas pelo grupo nesta revisão

- G01: citações fazem parte do projeto completo.
- G02: uso apenas em demonstração acadêmica, sem operação para usuários reais.
- G03: desenvolvimento ao longo da disciplina e apresentação completa na última aula; nenhuma primeira entrega separada.
- G04: não ampliar os tipos além das famílias já documentadas por enquanto.
- G05: deixar de lado o padrão específico da Unifor nesta etapa.

**Proposta técnica decorrente:** autor-data com diretas curtas/longas e indiretas; sistema numérico, apud e desambiguação automática de uma bibliografia inteira não são prometidos. O grupo ainda pode ajustar essa delimitação, sem alterar a decisão já confirmada de incluir citações.

Correção do exemplo anterior na conversa: para o padrão 10520:2023, o exemplo de pessoa física deve ser `(Silva, 2025)`, não `(SILVA, 2025)`. A regra da chamada no texto difere da entrada da referência. Consultadas as seções 6.1, 7.1 e 7.2 do PDF enviado.
