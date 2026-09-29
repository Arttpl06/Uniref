# Plano de implementação

## Situação deste pacote

A documentação e os diretórios estão preparados. Código de aplicação, migrations, schemas, componentes, testes e deploy ainda serão implementados. Não há um servidor pronto neste ZIP.

## Primeiro incremento: um livro de ponta a ponta

Antes de tentar todos os formulários, construir uma fatia funcional: dados de um livro → validação → formatter → prévia → cópia. Esse incremento prova o caminho central e o contrato da API. Adicionar persistência e autenticação em seguida, depois ampliar tipos.

### Passo 1 — Decisões e ambiente

Decisões confirmadas: citações fazem parte da entrega final; uso somente para demonstração; apresentação completa na última aula. Padrão Unifor e ampliação de tipos ficam fora do escopo atual. Definir data da aula, dedicação de cada integrante e revisar a delimitação técnica de citações em CITACOES.md.

Instalar Node 24 LTS, Git e MySQL 8.4 no ambiente de desenvolvimento; Docker é opcional. Fixar versões usadas e criar banco de desenvolvimento e banco de teste separados. Usuário da aplicação não deve ser root.

### Passo 2 — Inicializar aplicações

Criar package.json em backend e instalar Express 5, Sequelize 6, mysql2, Zod 4 e as dependências de sessão/segurança documentadas. Configurar backend como ES Modules e migrations em escopo CommonJS compatível com sequelize-cli 6.

Criar o projeto React pelo template JavaScript do Vite em diretório temporário vazio e incorporar em frontend, preservando a organização proposta. Em seguida instalar Router, React Hook Form, resolver de Zod e ferramentas de teste. Não usar template TypeScript por engano se o grupo quiser manter ambos os lados em JS.

Criar scripts de desenvolvimento, build, teste e lint; versionar lockfiles. A partir daí, outros integrantes usam npm ci. O pacote atual não traz comandos de execução de uma aplicação inexistente.

### Passo 3 — Schemas e contrato

Implementar schemas de livro e erros conforme API.md; criar shared como workspace privado se houver reaproveitamento direto. Escrever a primeira fixture bibliográfica revisada antes do formatter. Fazer mock da API para o frontend, usando exatamente o mesmo JSON do contrato.

### Passo 4 — Motor e prévia

Criar formatter puro de livro, validar segmentos/texto e expor POST /preview. Construir formulário e prévia React. Cobrir entrada válida, campo ausente, rede indisponível e falha de cópia. Não persistir nessa etapa.

### Passo 5 — Banco, autenticação e histórico

Criar migrations e models; implementar hash, sessão, CSRF, login e logout. Em seguida salvar e listar referências com filtros por userId. Implementar edição com version e exclusão. Testar com dois usuários antes de liberar a tela de histórico.

### Passo 6 — Tipos previstos, citações e homologação

Adicionar artigo, página web e trabalho acadêmico, repetindo schema → fixture → formatter → formulário → teste integrado. Não liberar um tipo cujo caso comum ainda não foi revisado. Implementar em paralelo o motor de citações autor-data, seu formulário e testes. Integrar chamada narrativa/parentética, direta curta/longa e indireta. Atualizar matriz de cobertura e ajuda da interface.

### Passo 7 — Revisão e entrega

Revisar acessibilidade e usabilidade, medir metas, testar migrations e restauração. Preparar ambiente de demonstração local ou hospedado com MySQL; usar HTTPS quando hospedado. Registrar limitações conhecidas e preparar roteiro com dados fictícios.

## Configurações previstas

| Variável | Uso |
|---|---|
| NODE_ENV | development, test ou production |
| PORT | Porta do backend |
| DB_HOST, DB_PORT, DB_NAME | Conexão com o banco |
| DB_USER, DB_PASSWORD | Credencial de menor privilégio |
| SESSION_SECRET | Segredo longo, aleatório e externo ao código |
| APP_ORIGIN | Origem permitida para validação de requisições |
| VITE_API_BASE_URL | Caminho público /api/v1, nunca credenciais |

Criar .env.example com placeholders; ignorar .env e credenciais no Git. Tudo com prefixo VITE pode chegar ao navegador: não colocar senha de banco nele. Configurar limite de proxy confiável conforme hospedagem, sem aceitar qualquer proxy indiscriminadamente.

## Cronograma de referência

As fases abaixo organizam o trabalho durante toda a disciplina. Não são entregas parciais e não fixam semanas: distribuir conforme a data da última aula e a disponibilidade dos quatro integrantes.

| Fase interna | Objetivo | Saída verificável |
|---|---|---|
| 1 | Requisitos, protótipos e regras | Escopo ratificado, telas e corpus inicial |
| 2 | Livro e prévia | Fluxo gerar/copiar integrado |
| 3 | Autenticação e MySQL | Conta, sessão e salvamento |
| 4 | Histórico, tipos previstos e citações | CRUD privado, quatro famílias e citações integradas |
| 5 | Testes e revisão normativa | Corpus revisado e testes de segurança |
| 6 | Usabilidade, deploy e apresentação | Demonstração, documentação e evidências |

## Divisão sugerida para quatro integrantes

| Frente | Responsabilidade principal | Revisão cruzada |
|---|---|---|
| A | React, componentes e acessibilidade | Revisar contratos e mensagens da API |
| B | API, autenticação e segurança | Revisar histórico no frontend |
| C | Banco, repositories e migrations | Revisar autorização e transações |
| D | Motores de referências/citações, corpus e documentação | Revisar dados e formulários |

Não associar pessoas a frentes sem combinar disponibilidade. Cada mudança deve ter ao menos uma revisão de outra frente. Todos precisam conseguir executar o projeto e explicar o fluxo completo.

## Git e pronto para integrar

Usar main estável, branches curtas por entrega e pull requests pequenos. Exemplo: feat/book-preview. Cada PR informa problema, mudança, requisito atendido e evidência de teste. Commits não contêm .env, node_modules, dados de usuários ou os PDFs normativos do acervo.

Uma tarefa está pronta quando atende critérios do requisito, foi revisada, passa verificações relevantes, tem mensagens de erro e atualiza documentação quando muda contrato. Não confundir “tela pronta” com fluxo integrado concluído.
