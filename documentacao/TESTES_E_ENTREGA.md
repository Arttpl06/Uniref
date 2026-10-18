# Qualidade, segurança e entrega

## Plano de testes rastreável

Testes abaixo são planejados. Nenhum teste de aplicação foi executado nesta entrega de documentação.

| Caso | Requisitos | Verificação |
|---|---|---|
| T01 Cadastro e login | RF01–02 | Conta válida via Firebase, duplicidade, senha incorreta, renovação do token e logout; e-mail fora do domínio recebe erro e não cria registro no MySQL |
| T02 Formulários por tipo | RF03–05 | Campos condicionais e validação equivalente na API |
| T03 Corpus normativo | RF06, RF13, RN01–02 | Comparação exata de saída com exemplos revisados e versão correta |
| T04 Prévia pública | RF07, RN09 | Gera sem cadastro; não insere referência |
| T05 Cópia | RF08, RN12 | Clipboard simples, rico e bloqueado; caracteres e destaque |
| T06 Salvamento | RF09, RN04, RN07 | Resultado calculado no servidor, transação e falha no meio da operação |
| T07 Isolamento | RF10–12, RN03 | Usuário B tenta ler, editar e excluir id do usuário A; todos retornam 404 |
| T08 Atualização concorrente | RF11 | Duas abas editam mesma version; segunda recebe 409 |
| T09 Idempotência | RF09 | Repetição com mesma chave/dados não duplica; outros dados com mesma chave dão 409 |
| T10 Histórico | RF10, RN08 | Busca, filtro, ordenação e paginação; versão antiga não recalcula |
| T11 XSS e entradas abusivas | RNF06, RNF09 | Tags são texto; URL inválida rejeitada; body grande e propriedades extras bloqueadas |
| T12 Autenticação Bearer | RNF06 | Mutação sem token rejeitada; token inválido ou expirado não autentica |
| T13 Usabilidade e acesso | RF14, RNF03–05 | Tarefa com 5 participantes, teclado e leitor de tela |
| T14 Ambiente e banco | RNF10–11 | Migrations em MySQL, backup e restauração em ambiente isolado |
| T15 Desempenho | RNF02 | Carga e p95 com ambiente e amostra registrados |
| T22 Restrição de domínio | RF01 | Cadastro com @unifor.br sincroniza; outros domínios recebem 403 no sync e não vira usuário no MySQL |

## Níveis de teste

Vitest para funções puras e schemas. Supertest para rotas com services integrados. Integração de persistência usa MySQL separado, não SQLite como substituto definitivo: tipos JSON, constraints e collation podem diferir. React Testing Library valida comportamento de formulários, mensagens e estados. Fluxos completos podem começar com roteiro manual reproduzível e evoluir para Playwright conforme necessidade.

Separar fixtures fictícias de dados reais. Não executar limpeza de teste em banco de desenvolvimento ou produção; exigir DB_NAME específico de teste e impedir execução destrutiva fora dele.

## Segurança operacional

- Firebase Auth gerencia hash de senha, bloqueio de tentativas e recuperação de senha; jamais logar senha ou conteúdo de autenticação.
- ID token JWT com expiração automática; firebase-admin verifica assinatura e expiração no backend.
- Rate limit proposto: geração 60/min por IP; ajustar com medição e considerar redes universitárias compartilhadas. Limites em memória servem apenas a uma instância. Login e recuperação de senha contam com bloqueio e limitação nativos do Firebase Auth.
- Validar todos os corpos, parâmetros e query strings no servidor. Selecionar campos permitidos explicitamente; não passar req.body diretamente a model.update.
- Consultas parametrizadas/ORM; proprietário vem do token verificado; não confiar na ocultação de botões do frontend.
- Logs estruturados com requestId, rota, status e duração, sem corpo bibliográfico ou credenciais por padrão.
- Usar apenas contas, e-mails e referências fictícios na demonstração. Operação pública não faz parte da entrega.

## Publicação

A demonstração pode ocorrer localmente ou em hospedagem de demonstração. Se hospedado, o ambiente deve suportar Node, frontend estático, HTTPS e MySQL. Usar mesma origem para simplificar o envio do Bearer token. Documentar preparação e restauração dos dados fictícios antes da última aula.

Pipeline planejado: npm ci → lint → testes → build React → migration revisada → deploy → smoke test. Antes de migration destrutiva, fazer backup e planejar compatibilidade da aplicação anterior. Reverter aplicação não reverte automaticamente dados.

Smoke test após deploy: página abre; prévia funciona; login funciona; registro é salvo; logout encerra autenticação; usuário diferente não lê o registro. Monitorar erros 5xx e falhas de conexão.

## Critério de entrega final

Todos os RFs do escopo final ratificado atendidos; corpus dos tipos liberados revisado; testes de isolamento e autenticação aprovados; tarefas principais utilizáveis; migrations reproduzíveis; ambiente de demonstração funcional; instruções de execução atualizadas com comandos reais; limitações listadas.

Operação pública e padrão específico da Unifor estão fora do escopo atual. A apresentação final inclui referências e citações funcionando; as etapas internas não são entregas parciais.

## Testes de citações

| Caso | Requisitos | Verificação |
|---|---|---|
| T16 Chamada indireta | RF15, RF19 | Narrativa Silva (2025) e parentética (Silva, 2025), sem aspas adicionadas |
| T17 Direta curta | RF20–21 | Trecho obrigatório, aspas e localizador quando disponível; metadados preservados |
| T18 Direta longa | RF19–21 | Bloco sem aspas externas, orientações de recuo/fonte/espaçamento, sem inferir linhas pelo tamanho da string |
| T19 Fonte sem páginas | RF20 | Não inventar página; confirmação explícita de ausência de localizador; aviso de revisão |
| T20 Citação de referência salva | RF22, RN03 | Acesso cruzado retorna 404; mesma fonte pode gerar diversas chamadas sem alterar histórico |
| T21 Regras contextuais | RN16–17 | Sobrenomes, autoria institucional/desconhecida, múltiplos autores e colisão autor/ano conforme corpus; casos sem suporte não passam silenciosamente |

Resultados esperados devem ser revisados contra NBR 10520:2023. A implementação ainda não foi executada ou homologada.
