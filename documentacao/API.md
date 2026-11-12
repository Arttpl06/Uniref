# Contrato proposto da API

Base: `/api/v1`. JSON UTF-8. Autenticação por Bearer token (Firebase Auth). Este é um contrato textual para implementação; converter em OpenAPI quando as rotas forem iniciadas.

## Rotas

| Método e rota | Acesso | Entrada / comportamento | Sucesso |
|---|---|---|---|
| GET /health | Público | Estado mínimo do processo, sem segredos | 200 |
| POST /auth/sync | Token Firebase válido | Bearer token; valida domínio @unifor.br e faz upsert do usuário no MySQL | 200 |
| GET /auth/me | Autenticado | Usuário atual sem dados sensíveis | 200 |
| POST /references/preview | Público | Documento bibliográfico, sem persistência | 200 |
| POST /references | Autenticado | Documento; header Idempotency-Key UUID | 201 ou 200 em repetição |
| GET /references | Autenticado | page, pageSize, type e q; título no filtro q | 200 |
| GET /references/:id | Autenticado | Consulta por id e usuário autenticado | 200 |
| PUT /references/:id | Autenticado | Documento completo e version atual | 200 |
| DELETE /references/:id | Autenticado | Remove somente registro próprio | 204 |

Firebase Auth no frontend retorna um ID token (JWT) após login. O frontend envia `Authorization: Bearer <idToken>` nas rotas autenticadas. O backend verifica a assinatura via `firebase-admin` e extrai `uid` e `email`. Sem cookie de sessão, o mecanismo CSRF não é necessário. POST /auth/sync é chamado após o login no Firebase: o backend valida o e-mail contra ALLOWED_EMAIL_DOMAIN e grava/atualiza users por firebaseUid. E-mail fora do domínio retorna 403 e nenhum registro é criado no MySQL.

## Entrada de livro

```json
{
  "tipo": "livro",
  "autoria": "conhecida",
  "quantidadeAutores": 2,
  "responsabilidade": "Autor da Obra",
  "abreviacao": false,
  "autores": [
    { "tipo": "pessoa", "nome": "Ana Silva" },
    { "tipo": "pessoa", "nome": "Bruno Costa" }
  ],
  "titulo": "Introdução à pesquisa",
  "subtitulo": null,
  "outraResponsabilidade": null,
  "serie": null,
  "edicao": "2",
  "localPublicacao": "Fortaleza",
  "editora": "Editora Exemplo",
  "anoPublicacao": "2025",
  "notas": null,
  "online": false,
  "url": null,
  "dataAcesso": null,
  "numeracaoPaginas": null,
  "suporteFisico": null
}
```

Exemplo fictício. Perfil normativo é fixado pelo servidor no escopo final; usuário não pode enviar versões arbitrárias. Schemas estritos rejeitam userId, textoPuro, campos extras e valores de tipo desconhecidos. Limites propostos: body 64 KiB; título 1.000 caracteres; até 10 autores por referência (`quantidadeAutores`); URL até 2.048 caracteres. São limites técnicos, não regras ABNT.

### Regras de consistência do livro (422 quando violadas)

- `quantidadeAutores` (1 a 10) é obrigatório quando `autoria = "conhecida"` e proibido quando `"desconhecida"`.
- `abreviacao = false` exige um nome por autor: `autores.length === quantidadeAutores`.
- `abreviacao = true` exige `quantidadeAutores ≥ 4` e apenas o primeiro autor na lista (o formulário de livros esconde os demais campos nesse caso).
- Autoria `conhecida` exige ao menos um autor; `desconhecida` exige lista vazia.
- Todos os autores de uma referência são do mesmo `tipo` (só pessoas ou só instituições), como o formulário impede.
- `url` aceita somente `http`/`https` (`ftp:`, `mailto:`, `javascript:` são rejeitados).
- `online = true` exige `url` e `dataAcesso` (ISO `AAAA-MM-DD`); com `online = false` os dois devem ser `null`.
- Campos opcionais vazios (`""`, espaços) são normalizados para `null`: `subtitulo`, `outraResponsabilidade`, `serie`, `edicao`, `notas`, `url`, `dataAcesso`, `subordinacao`.

O motor de livro está em `backend/src/domain/formatters/` (`livro.js`, `helpers.js`, `index.js`, `version.js`). Ele recebe o documento já validado e devolve `{textoPuro, segmentos, avisos, versaoNorma, versaoFormatador, perfilInstitucional}`. A concatenação de `segmentos[].texto` é exatamente `textoPuro`. Apenas o título recebe `destaque: "negrito"`; na entrada pelo título (autoria desconhecida), todos os segmentos usam `destaque: "nenhum"`.

### Mapeamento do formulário de livros (`frontend/src/pages/livros.jsx`) para o contrato

| Campo do formulário | Valor enviado |
|---|---|
| Tipo do Autor: "Desconhecido" | `autoria: "desconhecida"`, `autores: []`, sem `quantidadeAutores` |
| Tipo do Autor: "Pessoa(s) Física(s)" | `autoria: "conhecida"`, `autores: [{ tipo: "pessoa", nome: "<Nome Completo>" }]` (um objeto por campo de autor) |
| Tipo do Autor: "Pessoa(s) Jurídica(s)" | `autores: [{ tipo: "instituicao", nomeInstituicao: "<Autor>", subordinacao: <Subordinação> \|\| null }]` |
| Quantidade de Autores (select 1–10) | `quantidadeAutores: Number(quantidadeAutores)` |
| Forma Abreviada: "Sim"/"Não" | `abreviacao: true/false` |
| Responsabilidade Intelectual | `responsabilidade`: "Autor da Obra" (igual ao schema), "Organizador", "Editor", "Compilador" |
| Nº de páginas/volumes/folhas | `numeracaoPaginas: { tipo: "paginas" \| "volumes" \| "folhas", valor: String(quantidadePaginas) }`; vazio → `null` |
| Descrição Física do Suporte | `suporteFisico`: "Nenhum"→`meio: "nenhum"`; "CD-ROM"→`"cdrom"`; "DVD"→`"dvd"`; "E-Book"→`"ebook"`; "Blu-ray"→`"blu_ray"`; "Outro"→`"outro"` + `outroMeio: outroSuporteFisico`; `quantidade` = qtdSuporteFisico (omitir em E-Book) |
| On-Line?: "Sim"/"Não" | `online: true/false` |
| Endereço (URL), data do acesso | `url`, `dataAcesso` (`type="date"` já produz `AAAA-MM-DD`; vazio → `null`) |
| Ano(aaaa) | `anoPublicacao` — deve ser campo de texto livre (formulário atual usa `type="number"`, que bloqueia formas normativas como `[1969?]`, `c1993`) |
| Nº da Edição | `edicao: String(edicao)` → `3. ed.` |
| Título, Subtítulo, Local, Editora, Série, Notas, Outro tipo de responsabilidade, Subordinação | Envio direto (`titulo`, `subtitulo`, `localPublicacao`, `editora`, `serie`, `notas`, `outraResponsabilidade`, `subordinacao`); vazios → `null` |

## Saída de prévia

```json
{
  "data": {
    "textoPuro": "SILVA, Ana. Introdução à pesquisa. 2. ed. Fortaleza: Editora Exemplo, 2025.",
    "segmentos": [
      { "texto": "SILVA, Ana.", "destaque": "nenhum" },
      { "texto": " ", "destaque": "nenhum" },
      { "texto": "Introdução à pesquisa", "destaque": "negrito" },
      { "texto": ".", "destaque": "nenhum" },
      { "texto": " ", "destaque": "nenhum" },
      { "texto": "2. ed.", "destaque": "nenhum" },
      { "texto": " ", "destaque": "nenhum" },
      { "texto": "Fortaleza: Editora Exemplo, 2025.", "destaque": "nenhum" }
    ],
    "avisos": [],
    "versaoNorma": "ABNT NBR 6023:2025",
    "versaoFormatador": "0.2.0",
    "perfilInstitucional": null
  }
}
```

Saída atual do motor de livro. A concatenação de segmentos[].texto é igual a textoPuro. Segmentos permitem copiar com destaque sem receber HTML arbitrário. Renderizar texto com React e aplicar strong/em conforme o enum controlado `destaque` ("negrito"/"nenhum"). Para clipboard rico, gerar HTML escapado exclusivamente desses segmentos.

### Exemplos de saídas do motor (ABNT NBR 6023:2025)

| Entrada | Saída |
|---|---|
| Pessoa, 2 autores | `SILVA, Ana; COSTA, Bruno. Introdução à pesquisa. Fortaleza: Editora Exemplo, 2025.` |
| 4 autores abreviados (`quantidadeAutores: 4`, 1 nome) | `TAYLOR, Robert et al. Reabilitação... São Paulo: Roca, 2008.` |
| Instituição com órgão subordinado | `BRASIL. Ministério da Justiça. Relatório de atividades. Brasília, DF: Ministério da Justiça, 1993.` |
| `São Paulo (Estado)` + subordinação | `SÃO PAULO (Estado). Secretaria do Meio Ambiente. ... 1993.` |
| E-book com páginas | `... Porto Alegre: EDIPUCRS, 2011. E-book (213 p.).` |
| CD-ROM com faixa de páginas | `... 2007. 1 CD-ROM (p. 1-90).` |
| Volumes compostos | `... 1996. 5 v. em 3.` |
| `[S. l.]` + `[s. n.]` | `GONÇALVES, F. B. A história de Mirador. [S. l.: s. n.], 1993.` |

Avisos possíveis hoje: `AUTORES_AUSENTES`, `ABREVIACAO_IGNORADA`, `EBOOK_QUANTIDADE_IGNORADA`, `ONLINE_INCOMPLETO`, `AUTORES_IGNORADOS_DESCONHECIDA`, `RESPONSABILIDADE_IGNORADA_DESCONHECIDA`. Cada aviso tem `{codigo, campo, mensagem}`. O schema já bloqueia as combinações que os geram; os avisos protegem chamadas diretas ao motor.

Salvamento acrescenta id, version, createdAt e updatedAt. GET individual retorna também os dados originais. Listagem retorna `{data: [...], pagination: {page, pageSize, total}}`; itens contêm id, tipo, titulo, textoPuro, versões e datas. Não retornar tokens, e-mails ou dados de outros usuários.

## Erros

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Revise os campos indicados.",
    "fields": [
      { "path": "dataAcesso", "message": "Informe uma data de acesso válida." }
    ],
    "requestId": "identificador-de-correlacao"
  }
}
```

400 = JSON malformado; 401 = token ausente/inválido/expirado; 403 = domínio não permitido; 404 = registro inexistente ou de outro usuário; 409 = e-mail duplicado, conflito de versão ou chave de idempotência com outro conteúdo; 413 = corpo excessivo; 422 = dados semanticamente inválidos ou caso normativo não suportado; 429 = limite excedido; 500 = falha interna; 503 = dependência temporariamente indisponível.

Não expor stack trace, SQL, hash ou senha. A criação de conta e o login ocorrem no Firebase Auth, que aplica mensagens genéricas e bloqueio de tentativas; o backend não valida credenciais. Em /auth/sync o usuário já está autenticado, portanto não há enumeração de e-mails.

## Comunicação frontend/backend

Usar fetch centralizado, header `Authorization: Bearer <idToken>` nas rotas autenticadas, timeout via AbortController e tratamento de respostas não JSON. Não chamar response.json() em 204. Diferenciar erro de campo, autenticação e rede.

Em desenvolvimento, configurar proxy Vite de /api para a API local. Em produção, servir SPA e API sob a mesma origem via proxy reverso. Se forem origens separadas, permitir apenas a origem explícita; nunca CORS `*`. O ID token do Firebase é gerenciado pelo SDK no cliente.

## Citações: novo contrato da entrega final

`POST /api/v1/citations/preview`, com rate limit: gera chamada/citação sem persistir. Permite exatamente uma fonte: `source.document` com o documento estruturado do contrato de referências, ou `source.referenceId` UUID de referência salva. A segunda opção exige login e busca por id + userId; retorna 404 para fonte alheia.

```json
{
  "source": { "referenceId": "6f21cf49-b00a-438d-971d-1e9f6ba47b06" },
  "system": "authorDate",
  "kind": "directShort",
  "placement": "parenthetical",
  "excerpt": "A organização facilita a consulta.",
  "locator": { "kind": "page", "value": "12" },
  "sourceHasNoLocator": false
}
```

Exemplo fictício, com chamada esperada `(Silva, 2025, p. 12)` para uma fonte de Ana Silva de 2025. `kind`: indirect, directShort ou directLong. `placement`: narrative ou parenthetical. `locator`: page ou location, com texto limitado e validado; null somente nas condições de CITACOES.md. Não aceitar author/year extras para sobrescrever os metadados da fonte salva.

Resposta: `{data: {callout, composedText, segments, presentation, warnings, citationStandardVersion, citationFormatterVersion}}` (contrato de citações permanece como está por enquanto). Norma de citação: `ABNT NBR 10520:2023`. `composedText` é null se a indireta solicitar somente chamada. `presentation` identifica inline ou block e fornece orientações; a aplicação não garante layout no editor de destino. Usar os mesmos erros padronizados da API; direta sem trecho ou localização contraditória retorna 422. Não aceitar source com document e referenceId juntos.

Limites técnicos propostos: excerpt até 10.000 caracteres, locator.value até 100, body total 64 KiB. Não armazenar texto citado em logs. Chamada narrativa fica separada para encaixe na redação; a composição demonstrativa pode usar dois-pontos depois dela, sem inventar frases atribuídas ao autor.
