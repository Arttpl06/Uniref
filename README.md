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

React + Vite no frontend; Node.js + Express em JavaScript no backend; Sequelize + mysql2 para persistência no MySQL. Monólito modular com API REST e motor determinístico de referências. Nenhuma IA é necessária para gerar as referências.

As pastas backend, frontend e shared são espaços reservados para implementação. Leia seus README antes de começar. Não execute `npm start`: ainda não existem scripts ou aplicação.
