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
  "type": "book",
  "authorship": "known",
  "authors": [
    { "kind": "person", "givenNames": "Ana", "familyName": "Silva" }
  ],
  "title": "Introdução à pesquisa",
  "metadata": {
    "subtitle": null,
    "edition": "2",
    "publicationPlace": "Fortaleza",
    "publisher": "Editora Exemplo",
    "publicationDate": { "literal": "2025", "kind": "exact" },
    "online": false
  }
}
```

Exemplo fictício. Perfil normativo é fixado pelo servidor no escopo final; usuário não pode enviar versões arbitrárias. Schemas estritos rejeitam userId, plainText, campos extras e valores de tipo desconhecidos. Limites propostos: body 64 KiB; título 1.000 caracteres; até 50 autores; URL até 2.048 caracteres. São limites técnicos, não regras ABNT.

## Saída de prévia

```json
{
  "data": {
    "plainText": "SILVA, Ana. Introdução à pesquisa. 2. ed. Fortaleza: Editora Exemplo, 2025.",
    "segments": [
      { "text": "SILVA, Ana. ", "emphasis": "none" },
      { "text": "Introdução à pesquisa", "emphasis": "bold" },
      { "text": ". 2. ed. Fortaleza: Editora Exemplo, 2025.", "emphasis": "none" }
    ],
    "warnings": [],
    "standardVersion": "ABNT NBR 6023:2025",
    "formatterVersion": "0.1.0",
    "institutionalProfile": null
  }
}
```

Saída ilustrativa a homologar. A concatenação de segments.text deve ser igual a plainText. Segmentos permitem copiar com destaque sem receber HTML arbitrário. Renderizar texto com React e aplicar strong/em conforme enum controlado. Para clipboard rico, gerar HTML escapado exclusivamente desses segmentos.

Salvamento acrescenta id, version, createdAt e updatedAt. GET individual retorna também os dados originais. Listagem retorna `{data: [...], pagination: {page, pageSize, total}}`; itens contêm id, type, title, plainText, versões e datas. Não retornar tokens, e-mails ou dados de outros usuários.

## Erros

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Revise os campos indicados.",
    "fields": [
      { "path": "metadata.accessDate", "message": "Informe uma data de acesso válida." }
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

Resposta: `{data: {callout, composedText, segments, presentation, warnings, citationStandardVersion, citationFormatterVersion}}`. Norma de citação: `ABNT NBR 10520:2023`. `composedText` é null se a indireta solicitar somente chamada. `presentation` identifica inline ou block e fornece orientações; a aplicação não garante layout no editor de destino. Usar os mesmos erros padronizados da API; direta sem trecho ou localização contraditória retorna 422. Não aceitar source com document e referenceId juntos.

Limites técnicos propostos: excerpt até 10.000 caracteres, locator.value até 100, body total 64 KiB. Não armazenar texto citado em logs. Chamada narrativa fica separada para encaixe na redação; a composição demonstrativa pode usar dois-pontos depois dela, sem inventar frases atribuídas ao autor.
