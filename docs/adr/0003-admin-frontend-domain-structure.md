# ADR-0003 — Estrutura por domínio do frontend administrativo

- Status: Aceita
- Data: 2026-09-07
- Decisores: responsável do produto e time de engenharia

## Contexto

A pasta `resources/js/Modulos/Admin` passou a ter versões duplicadas do mesmo domínio, com nomes em português e inglês e entry points monolíticos na raiz. Exemplos identificados: `AdminMarketing.jsx` e `Marketing/MarketingPrincipal.jsx`; `AdminCarriers.jsx`, `Carriers/` e `Logistica/Carriers/`; `Orders/` e `Pedidos/`; `Products/` e `Produtos/`.

Essas cópias tornam imports ambíguos, aumentam o risco de o painel montar uma implementação diferente da que está sendo evoluída e preservam telas com dados simulados.

## Decisão

O frontend administrativo continua no monólito, mas cada domínio terá uma única fronteira em `resources/js/Modulos/Admin/<Domain>/`:

- nomes técnicos de pastas e arquivos novos em inglês;
- uma página de entrada por domínio, nomeada `<Domain>Page.jsx`;
- subpastas em inglês por responsabilidade, por exemplo `components`, `api`, `shared`, `audit`, `packages` e `providers`;
- nomes de produtos e provedores podem conservar seu nome oficial, como `MelhorEnvio`;
- `AppShell`, `DesignSystem` e `Shared` são infraestrutura compartilhada, não domínios de negócio;
- a raiz `Admin/` não mantém páginas `Admin*.jsx` de domínio após a migração;
- cada import é atualizado no mesmo PR em que o arquivo é movido; o caminho antigo é removido, não mantido como reexportação.

A página ativa de cada rota precisa apontar para o entry point canônico. Telas legadas com métricas, ações ou cadastros fictícios não são migradas como funcionais: são removidas do caminho de produção e substituídas por estado operacional até existir contrato tenant-scoped.

## Consequências

- Refatorações são feitas por domínio, com build e E2E a cada PR.
- Não há aliases ou caminhos de compatibilidade para duplicar código.
- Marketing será reorganizado depois do mapa estrutural: a implementação monolítica e simulada não define o contrato futuro.
- A configuração Stripe permanece em branch separada e só retoma após esta refatoração ser integrada.
- A implementação deve passar por build, Tests, E2E e Security antes de o caminho antigo ser considerado definitivamente removido.