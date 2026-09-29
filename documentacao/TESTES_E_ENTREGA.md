# Qualidade, segurança e entrega

## Plano de testes rastreável

Testes abaixo são planejados. Nenhum teste de aplicação foi executado nesta entrega de documentação.

| Caso | Requisitos | Verificação |
|---|---|---|
| T01 Cadastro e login | RF01–02 | Conta válida, duplicidade, senha incorreta, renovação da sessão e logout |
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
| T12 Sessão/CSRF | RNF06 | Mutação sem token rejeitada; cookie antigo após logout não autentica |
| T13 Usabilidade e acesso | RF14, RNF03–05 | Tarefa com 5 participantes, teclado e leitor de tela |
| T14 Ambiente e banco | RNF10–11 | Migrations em MySQL, backup e restauração em ambiente isolado |
| T15 Desempenho | RNF02 | Carga e p95 com ambiente e amostra registrados |

## Níveis de teste

Vitest para funções puras e schemas. Supertest para rotas com services integrados. Integração de persistência usa MySQL separado, não SQLite como substituto definitivo: tipos JSON, constraints e collation podem diferir. React Testing Library valida comportamento de formulários, mensagens e estados. Fluxos completos podem começar com roteiro manual reproduzível e evoluir para Playwright conforme necessidade.

Separar fixtures fictícias de dados reais. Não executar limpeza de teste em banco de desenvolvimento ou produção; exigir DB_NAME específico de teste e impedir execução destrutiva fora dele.

## Segurança operacional

- Hash de senha com Argon2id; jamais logar senha, cookie ou conteúdo de sessão. Calibrar custo no ambiente e testar negação de serviço no endpoint de login.
- Cookie HttpOnly, Secure em HTTPS, SameSite=Lax e escopo mínimo. Sessão com expiração absoluta proposta de 24 horas, sem renovação indefinida; remover sessões expiradas periodicamente.
- Regenerar sessão ao autenticar e invalidar no logout. Token CSRF sincronizado para mutações e validação de origem.
- Rate limit proposto: login 5 tentativas por minuto por IP, geração 60/min por IP; ajustar com medição e considerar redes universitárias compartilhadas. Limites em memória servem apenas a uma instância.
- Validar todos os corpos, parâmetros e query strings no servidor. Selecionar campos permitidos explicitamente; não passar req.body diretamente a model.update.
- Consultas parametrizadas/ORM; proprietário vem da sessão; não confiar na ocultação de botões do frontend.
- Logs estruturados com requestId, rota, status e duração, sem corpo bibliográfico ou credenciais por padrão.
- Coletar só nome, e-mail e referências; definir aviso de privacidade, retenção e canal de exclusão antes de abrir a usuários reais. Isso é requisito de produto a revisar, não certificação jurídica.

## Publicação

Hospedagem deve suportar processo Node persistente, frontend estático, HTTPS e MySQL. Propor mesma origem para simplificar cookies e CSRF. Selecionar fornecedor somente depois de conhecer orçamento, permissões da disciplina e exigência de disponibilidade.

Pipeline planejado: npm ci → lint → testes → build React → migration revisada → deploy → smoke test. Antes de migration destrutiva, fazer backup e planejar compatibilidade da aplicação anterior. Reverter aplicação não reverte automaticamente dados.

Smoke test após deploy: página abre; prévia funciona; login funciona; registro é salvo; logout encerra sessão; usuário diferente não lê o registro. Monitorar erros 5xx e falhas de conexão.

## Critério final de entrega do MVP

Todos os RFs do MVP ratificado atendidos; corpus dos tipos liberados revisado; testes de isolamento e sessão aprovados; tarefas principais utilizáveis; migrations reproduzíveis; ambiente publicado; instruções de execução atualizadas com comandos reais; limitações listadas.

Recuperação de senha e validação de e-mail podem ficar fora da demonstração com contas fictícias, mas devem ser reavaliadas antes de um serviço público permanente. Conformidade Unifor não deve ser anunciada enquanto o manual não for validado.
