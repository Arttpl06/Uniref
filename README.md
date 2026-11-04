# Gerador de Referências Bibliográficas

Proposta de engenharia para o projeto acadêmico da equipe de Artur Pinheiro, Eduardo Santos, Rafael Bezerra e Vitor Ribeiro. Preparada em 29/09/2026 a partir da apresentação enviada e do acervo ABNT.zip.

**Estado: planejamento técnico.** Este pacote contém documentação e estrutura inicial de pastas. Não contém uma aplicação implementada, dependências instaladas ou conformidade normativa certificada. Os exemplos são contratos de implementação, não resultados de testes executados.

## Comece aqui

1. [DOCUMENTACAO.md](documentacao/DOCUMENTACAO.md): visão completa, stack, arquitetura e funcionamento.
2. [REQUISITOS.md](documentacao/REQUISITOS.md): requisitos com prioridade, origem e critérios de aceite.
3. [BANCO_DE_DADOS.md](documentacao/BANCO_DE_DADOS.md): modelo e regras de persistência.
4. [API.md](documentacao/API.md): contratos entre React e Express.
5. [MOTOR_ABNT.md](documentacao/MOTOR_ABNT.md): escopo normativo e estratégia de validação.
6. [CITACOES.md](documentacao/CITACOES.md): especificação das citações da entrega final.
7. [DESENVOLVIMENTO.md](documentacao/DESENVOLVIMENTO.md): sequência de implementação e organização da equipe.
8. [TESTES_E_ENTREGA.md](documentacao/TESTES_E_ENTREGA.md): critérios de qualidade, segurança e publicação.
9. [APRESENTACAO.md](documentacao/APRESENTACAO.md): resumo para apresentar ao professor.
10. [FONTES_E_DECISOES.md](documentacao/FONTES_E_DECISOES.md): fontes, decisões e pontos em aberto.

## Escopo atual

A entrega final reúne o gerador de referências e o gerador de citações para uma demonstração acadêmica completa na última aula. A cobertura de referências permanece limitada a livro completo, artigo de periódico, página web e trabalho acadêmico; outros tipos de fonte e o padrão específico da Unifor ficam fora do escopo desta etapa.

## Decisão central

React + Vite no frontend; Node.js + Express em JavaScript no backend; Sequelize + mysql2 para persistência no MySQL; Firebase Auth para autenticação restrita ao e-mail institucional @unifor.br. Monólito modular com API REST e motor determinístico de referências. Nenhuma IA é necessária para gerar as referências.

As pastas backend, frontend e shared são espaços reservados para implementação. Leia seus README antes de começar. Não execute `npm start`: ainda não existem scripts ou aplicação.

## Ambiente local: MySQL 8.4 com Docker Compose e Sequelize

Este guia prepara um banco MySQL local e isolado para cada integrante da equipe. Cada colaborador mantém seu próprio volume de dados e pode escolher suas próprias senhas. As credenciais são apenas para desenvolvimento local e não devem ser compartilhadas nem copiadas para ambientes de produção.

O arquivo [`compose.yml`](compose.yml) usa a imagem `mysql:8.4`, cria o serviço `mysql` (contêiner `uniref-mysql`) e publica o banco somente no computador local:

```text
backend/Sequelize -> 127.0.0.1:3307 -> contêiner MySQL:3306
```

### 1. Pré-requisitos

Instale estas ferramentas antes de começar:

- **Docker Desktop**, com o Docker Compose v2 incluído. Abra o Docker Desktop e aguarde o mecanismo do Docker ficar ativo.
- **Node.js 24 LTS**, versão adotada na documentação técnica do UniRef. O `npm` é instalado junto com o Node.js.
- **Git**, para clonar o repositório e trabalhar com branches.

Confirme as instalações em um terminal:

```powershell
docker --version
docker compose version
node --version
npm --version
git --version
```

Execute os próximos comandos a partir da raiz do repositório, onde estão `compose.yml` e `.env.example`.

### 2. Configurar o `.env` da raiz

Crie o arquivo local a partir do exemplo:

```powershell
Copy-Item .env.example .env
```

Abra `.env` e defina valores locais. Exemplo:

```dotenv
MYSQL_ROOT_PASSWORD=troque_por_uma_senha_de_administracao
MYSQL_DATABASE=uniref
MYSQL_USER=uniref_app
MYSQL_PASSWORD=troque_por_uma_senha_da_aplicacao
```

As variáveis têm estas funções:

| Variável | Uso |
|---|---|
| `MYSQL_ROOT_PASSWORD` | Senha do usuário administrativo `root` do MySQL. A aplicação não deve usar esse usuário. |
| `MYSQL_DATABASE` | Banco criado na primeira inicialização. Para seguir os exemplos do projeto, use `uniref`. |
| `MYSQL_USER` | Usuário de menor privilégio usado pelo backend, por exemplo `uniref_app`. |
| `MYSQL_PASSWORD` | Senha do usuário definido em `MYSQL_USER`. Ela deverá ser repetida como `DB_PASSWORD` no backend. |

Cada integrante pode escolher senhas diferentes. Evite espaços no início ou no fim dos valores. O `.gitignore` já exclui `.env` e `backend/.env`: **nunca envie esses arquivos ou suas senhas ao GitHub**. Somente os arquivos `.env.example`, sem segredos reais, devem ser versionados.

### 3. Iniciar o MySQL

Na raiz do projeto, execute:

```powershell
docker compose up -d
```

Na primeira execução, o Docker baixa a imagem do MySQL 8.4, cria o volume persistente `mysql_data` e inicializa o banco. Esse processo pode levar alguns instantes mesmo depois que o contêiner aparecer como iniciado.

### 4. Verificar o contêiner e o MySQL

Consulte o estado do serviço:

```powershell
docker compose ps
```

O serviço `mysql` deve aparecer com estado `Up` ou `running` e com o mapeamento `127.0.0.1:3307->3306/tcp`.

Em seguida, confirme que o servidor já aceita conexões:

```powershell
docker compose exec mysql mysqladmin ping -h localhost -u root -p
```

Digite o valor de `MYSQL_ROOT_PASSWORD` quando solicitado. A resposta esperada é `mysqld is alive`. Usar `-p` sem escrever a senha no comando evita que ela fique visível no histórico do terminal.

### 5. Configurar o Sequelize em `backend/.env`

Crie o arquivo a partir do exemplo existente:

```powershell
Copy-Item backend/.env.example backend/.env
```

Mantenha as configurações de Firebase do exemplo e ajuste a seção do MySQL:

```dotenv
DB_HOST=127.0.0.1
DB_PORT=3307
DB_NAME=uniref
DB_USER=uniref_app
DB_PASSWORD=troque_por_uma_senha_da_aplicacao
```

Os valores precisam corresponder aos do `.env` da raiz:

| `backend/.env` | `.env` da raiz |
|---|---|
| `DB_NAME` | mesmo valor de `MYSQL_DATABASE` |
| `DB_USER` | mesmo valor de `MYSQL_USER` |
| `DB_PASSWORD` | mesmo valor de `MYSQL_PASSWORD` |

`DB_HOST=127.0.0.1` e `DB_PORT=3307` são corretos porque, neste fluxo, o backend roda diretamente no computador. A porta `3306` existe apenas dentro do contêiner. A conexão já é criada em `backend/src/config/database.js` com Sequelize 6, driver `mysql2`, dialeto `mysql` e fuso UTC.

### 6. Instalar as dependências do backend

O repositório contém `backend/package-lock.json`. Por isso, use `npm ci`, que instala exatamente as versões registradas no lockfile:

```powershell
Set-Location backend
npm ci
```

Não use `npm install` apenas para preparar o projeto, pois ele pode alterar o lockfile. Para voltar à raiz depois da instalação:

```powershell
Set-Location ..
```

### 7. Executar as migrations do Sequelize

As migrations são responsáveis por criar e evoluir as tabelas; alterar um model não altera automaticamente o banco. Conforme a arquitetura do UniRef, elas deverão ficar em `backend/src/database/migrations/`, ser versionadas e manter compatibilidade CommonJS com o `sequelize-cli`, enquanto a aplicação usa ES Modules.

**Situação atual:** o projeto ainda não contém migrations, `.sequelizerc` nem a configuração de ambiente consumida pelo `sequelize-cli`. Portanto, o comando de migration ainda não deve ser executado neste estado: ele não tem arquivos nem configuração suficientes para montar o schema planejado.

Depois que essa infraestrutura for implementada e enviada ao repositório, atualize sua branch, entre no backend e execute:

```powershell
Set-Location backend
npx sequelize-cli db:migrate
```

O `npx` utilizará o `sequelize-cli` já instalado pelas dependências de desenvolvimento do backend. Antes de executar, confira se a branch realmente contém a configuração do CLI e os arquivos em `src/database/migrations/`. Não substitua migrations por `sync({ force: true })` ou `sync({ alter: true })`: a documentação do projeto exige evolução explícita do schema, e essas opções podem causar alterações ou perda de dados.

### 8. Operações do contêiner

Execute estes comandos na raiz do projeto:

| Objetivo | Comando |
|---|---|
| Criar/iniciar em segundo plano | `docker compose up -d` |
| Consultar o estado | `docker compose ps` |
| Acompanhar os logs do MySQL | `docker compose logs -f mysql` |
| Exibir as últimas 100 linhas | `docker compose logs --tail 100 mysql` |
| Parar sem remover o contêiner | `docker compose stop mysql` |
| Iniciar um contêiner parado | `docker compose start mysql` |
| Parar e remover contêiner/rede | `docker compose down` |

`docker compose down` preserva o volume nomeado e, portanto, os dados do MySQL. **Não acrescente `-v` sem intenção clara:** `docker compose down -v` remove o volume e apaga todos os bancos locais desse ambiente. Antes de qualquer remoção de volume, confirme que os dados são descartáveis ou faça um backup.

### 9. Problemas comuns de conexão

#### Docker não está disponível

Se aparecer erro de conexão com o Docker daemon, abra ou reinicie o Docker Desktop e aguarde sua inicialização. Depois, repita `docker compose ps`.

#### `ECONNREFUSED` em `127.0.0.1:3307`

O MySQL pode estar parado ou ainda inicializando. Verifique:

```powershell
docker compose ps
docker compose logs --tail 100 mysql
```

Espere a mensagem de que o servidor está pronto para conexões e tente novamente. Confirme também `DB_HOST=127.0.0.1` e `DB_PORT=3307` em `backend/.env`.

#### A porta 3307 já está em uso

Descubra se outro processo já ocupa a porta:

```powershell
Get-NetTCPConnection -LocalPort 3307 -ErrorAction SilentlyContinue
```

Encerre o serviço conflitante ou combine com a equipe uma alteração coordenada em `compose.yml` e em `DB_PORT`. Alterar somente um dos lados impede a conexão.

#### `Access denied for user`

Compare `DB_USER` com `MYSQL_USER` e `DB_PASSWORD` com `MYSQL_PASSWORD`, sem publicar os valores. As variáveis `MYSQL_*` criam usuário, senha e banco apenas na **primeira** inicialização de um volume vazio. Editar o `.env` depois não troca automaticamente as credenciais já gravadas no MySQL.

Se o volume já contém dados, prefira restaurar os valores usados na primeira inicialização ou alterar a credencial dentro do MySQL de forma consciente. Apagar o volume recria o banco com o novo `.env`, mas também elimina todos os dados locais; trate isso apenas como uma reinicialização deliberada, nunca como o primeiro comando de diagnóstico.

#### `Unknown database` ou banco incorreto

Confirme que `DB_NAME` corresponde exatamente a `MYSQL_DATABASE`. Consulte os logs para verificar se a inicialização inicial terminou sem erros. Assim como as credenciais, mudar `MYSQL_DATABASE` não cria automaticamente outro banco em um volume já inicializado.

#### Confusão entre as portas 3307 e 3306

Use `127.0.0.1:3307` quando o backend estiver rodando no computador, como neste guia. `3306` é a porta interna do MySQL e seria usada por outro contêiner na mesma rede Docker, normalmente com o host `mysql`; essa não é a configuração atual do backend.

#### O comando de migration não encontra configuração ou migrations

Isso é esperado enquanto a infraestrutura descrita na seção 7 ainda não tiver sido implementada. Não crie tabelas manualmente nem use sincronização forçada para contornar a ausência. Atualize sua branch quando as migrations oficiais forem adicionadas e execute somente os arquivos versionados pela equipe.
