# Requisitos do sistema

Versão 0.2 — revisada com as decisões do grupo em 29/09/2026. Todos os itens estão **planejados**, não implementados. Obrigatório significa necessário na apresentação final; fora do escopo significa não previsto nessa entrega. Origem S = slide; P = proposta técnica; G = decisão do grupo. Citações, demonstração acadêmica e entrega única final estão confirmadas.

## Requisitos funcionais

| ID | Requisito verificável | Prioridade / origem | Critério de aceite |
|---|---|---|---|
| RF01 | Cadastrar usuário com nome, e-mail institucional e senha | Obrigatório / S | Dados válidos criam conta via Firebase Auth; e-mail @unifor.br duplicado retorna conflito; senha não aparece nas respostas |
| RF02 | Autenticar e encerrar autenticação | Obrigatório / S + P | Credenciais válidas permitem login via Firebase Auth; inválidas dão mensagem genérica; após logout o token anterior deixa de autorizar |
| RF03 | Selecionar livro, artigo de periódico, página web ou trabalho acadêmico | Obrigatório / S + P | Cada escolha exibe somente os campos aplicáveis; trabalho acadêmico distingue TCC, dissertação e tese |
| RF04 | Adicionar, remover e reordenar autores pessoais ou institucionais | Obrigatório / P | Ordem enviada é preservada; autoria desconhecida é opção explícita, sem autor inventado |
| RF05 | Validar metadados conforme o tipo e a condição online | Obrigatório / P | Campos inválidos são apontados individualmente; envio direto à API também é rejeitado |
| RF06 | Gerar referência segundo o perfil ABNT definido | Obrigatório / S | Todos os casos normativos homologados produzem exatamente a saída esperada; casos sem suporte mostram aviso ou bloqueio |
| RF07 | Gerar prévia sem exigir cadastro | Obrigatório / P | Visitante obtém resultado sem registro persistente e sem acesso a históricos |
| RF08 | Copiar a referência | Obrigatório / S | Cópia simples preserva caracteres e pontuação; quando cópia rica falhar, informar perda de destaque e oferecer seleção manual |
| RF09 | Salvar referência na conta | Obrigatório / S + P | Usuário autenticado salva metadados, resultado e versões; visitante recebe 401; userId do body nunca define o proprietário |
| RF10 | Listar e consultar histórico privado | Obrigatório / S | Usuário vê somente suas referências; busca, filtro e paginação mantêm o mesmo escopo |
| RF11 | Editar uma referência salva | Obrigatório / P | Alteração válida recalcula saída; dados e resultado são gravados juntos; versão antiga enviada retorna conflito |
| RF12 | Excluir uma referência salva | Obrigatório / P | Confirmação na interface remove apenas o registro do usuário; registro de outro usuário retorna 404 |
| RF13 | Exibir perfil e versão do formatador | Obrigatório / P | Resultado e histórico informam ABNT NBR 6023:2025 e versão do motor; atualização do motor não altera histórico silenciosamente |
| RF14 | Exibir orientação de preenchimento | Obrigatório / P | Campos especializados têm ajuda, exemplo fictício e indicação de obrigatoriedade |
| RF15 | Gerar citações diretas e indiretas no texto | Obrigatório / S + G; delimitação técnica P | Sistema autor-data com chamada narrativa e parentética, modalidade direta curta/longa ou indireta, localizador quando disponível e NBR 10520:2023; exemplos homologados e limites em CITACOES.md |
| RF16 | Organizar referências em coleções e exportar arquivos | Fora do escopo / P | Depende de requisitos de ordenação, estilo e formato de exportação |
| RF17 | Importar metadados por DOI/ISBN | Fora do escopo / P | Exige fornecedor, limites, proveniência e revisão dos dados importados |
| RF18 | Recuperar senha por e-mail | Obrigatório / P | Firebase Auth envia e-mail de recuperação; usuário redefine senha e volta a autenticar |

## Regras de negócio

| ID | Regra |
|---|---|
| RN01 | NBR 6023:2025 é a base de referências. Regras específicas da Unifor ficam fora do escopo atual |
| RN02 | NBR 10520:2023 rege as citações da entrega final; separar sua versão da norma de referências |
| RN03 | Cada referência salva pertence a um único usuário; nenhuma consulta, alteração ou exclusão pode ignorar esse vínculo |
| RN04 | O servidor é a autoridade para texto gerado, normalização e versão; valores calculados enviados pelo cliente são rejeitados |
| RN05 | Dados ausentes não podem ser inventados. Estados bibliográficos especiais exigem regra homologada ou resultado de revisão/bloqueio |
| RN06 | Autores mantêm ordem informada. Autor institucional e ausência explícita de autoria não são transformados em pessoa física |
| RN07 | A edição precisa preservar atomicidade entre metadados, autores, segmentos e texto |
| RN08 | Histórico conserva resultado e versões originais até uma edição explícita. Não recalcular automaticamente ao listar |
| RN09 | Gerar não salva; somente a ação Salvar grava histórico. O sistema informa claramente essa diferença |
| RN10 | Campos irrelevantes ao tipo selecionado são rejeitados na API; não reutilizar silenciosamente dados de outro formulário |
| RN11 | URL não substitui tipo documental. Um artigo encontrado online continua sendo artigo, com campos de acesso eletrônico |
| RN12 | Texto simples não preserva destaque tipográfico. A interface explica a limitação e oferece cópia rica quando suportada |

## Requisitos não funcionais e verificação

Metas abaixo são propostas de aceite, não medições realizadas.

| ID | Requisito / meta | Como verificar |
|---|---|---|
| RNF01 | Backend JavaScript, frontend React, banco MySQL e Firebase Auth | Revisar código, dependências e configuração |
| RNF02 | API responde à prévia com p95 ≤ 500 ms, sem incluir rede do usuário, com 20 usuários simultâneos | Executar carga de 5 minutos em ambiente identificado, registrar CPU/RAM e resultados |
| RNF03 | Pelo menos 4 de 5 participantes geram e copiam um livro em até 2 minutos, com metadados previamente disponíveis | Teste moderado, sem ajuda durante a tarefa, medindo do gerador aberto até a cópia |
| RNF04 | Fluxos completos em telas de 360 px e desktop de 1280 px sem rolagem horizontal indevida | Revisão manual dos fluxos e tamanhos |
| RNF05 | Formulários utilizáveis por teclado, com labels, foco visível, mensagens associadas e contraste adequado | Checklist de acessibilidade e teste manual com leitor de tela; alvo WCAG AA a validar |
| RNF06 | Token Firebase válido; acesso por proprietário | Testes de autenticação, Bearer token e acesso cruzado |
| RNF07 | Dados e saída são consistentes mesmo quando a gravação falha | Simular falha durante transação e verificar rollback |
| RNF08 | Regras bibliográficas têm testes unitários e conjunto de exemplos aprovados | Executar corpus homologado em todo pull request |
| RNF09 | Configuração sensível fora do repositório e erros sem stack trace para usuário | Inspecionar build, logs, .gitignore e respostas |
| RNF10 | Migrações reproduzem banco vazio e atualização da versão anterior | Testar em MySQL da mesma versão do projeto |
| RNF11 | Demonstração reproduzível com contas e dados fictícios | Documentar seed, preparação do banco e recuperação do ambiente antes da apresentação; sem operação pública contínua |
| RNF12 | Interface, validações e documentação em português brasileiro | Revisão funcional de todos os fluxos |

## Casos de uso essenciais

**UC01 — Gerar e copiar (RF03–RF08, RF13–RF14).** Ator: visitante ou usuário. Pré-condição: conhecer os dados da fonte. Fluxo: selecionar tipo, preencher, validar, gerar, revisar e copiar. Alternativas: erro de campo mantém entrada; falha de rede permite tentar novamente; clipboard indisponível permite selecionar texto. Pós-condição: referência disponível na tela, sem persistência automática.

**UC02 — Salvar (RF01–RF02, RF09).** Ator: usuário autenticado. Pré-condição: dados válidos e token ativo. Fluxo: clicar Salvar, API validar e gerar novamente, gravar em transação e confirmar. Se o token expirou, pedir login mantendo rascunho em memória. Se a resposta se perder, a chave de idempotência permite repetição sem duplicar.

**UC03 — Gerenciar histórico (RF10–RF12).** Ator: usuário autenticado. Fluxo: listar, buscar, abrir, editar ou excluir. Alternativas: referência alheia/inexistente retorna 404; edição concorrente retorna 409 e exige recarregar. Pós-condição: somente dados do próprio usuário são alterados.

## Limite da entrega final

Não incluir todos os tipos previstos na ABNT. Não incluir gestão de bibliotecas físicas, upload de PDFs, verificação de plágio, edição de trabalhos completos, colaboração em tempo real ou extração por IA. Esses itens não estão no núcleo do slide.

## Detalhamento obrigatório das citações

| ID | Requisito | Critério de aceite |
|---|---|---|
| RF19 | Escolher modalidade e posição da chamada | Oferecer indireta, direta curta e direta longa; narrativa ou parentética; escolha não muda dados da referência |
| RF20 | Informar trecho e localização | Direta exige trecho; localizador é exigido quando a fonte o possui; fonte sem localizador deve ser indicada explicitamente; indireta pode gerar só chamada |
| RF21 | Visualizar e copiar citação e chamada | Copiar chamada separada ou composição; direta longa mostra orientação de bloco; falha do clipboard oferece seleção manual |
| RF22 | Gerar citação a partir de referência salva | API verifica proprietário antes de carregar metadados; fonte alheia retorna 404; citação usa dados atuais do registro |

Todos: obrigatórios para a apresentação final, detalhamento técnico proposto a partir da inclusão de citações pelo grupo.

| ID | Regra complementar |
|---|---|
| RN13 | Referência pronta não é fonte de parsing: citações reutilizam autores e datas estruturados |
| RN14 | Não gerar automaticamente trechos ou paráfrases. Texto citado é fornecido pelo usuário |
| RN15 | Não deduzir quantidade de linhas por caracteres; usuário escolhe curta/longa conforme o documento de destino |
| RN16 | Citações e referências mostram suas próprias versões normativas. A formatação de sobrenomes em uma não deve ser copiada cegamente para a outra |
| RN17 | Não decidir sufixos a/b por uma fonte isolada; homônimos e obras de mesmo autor/ano dependem de contexto e exigem aviso de revisão |

**UC04 — Gerar citação (RF15, RF19–22).** Escolher fonte preenchida ou referência própria salva; selecionar modalidade e posicionamento; informar trecho/localizador quando aplicável; gerar, revisar e copiar. Entrada inválida mantém formulário e aponta campos. Fonte sem localizador exige confirmação explícita. Não há salvamento de histórico de citações na proposta atual; elas podem ser geradas novamente a partir da referência.
