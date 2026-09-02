# Arquitetura do HUB Commerce

A documentação arquitetural deve descrever o estado aprovado, não apenas intenções.

## Estrutura documental

- docs/adr: decisões permanentes e seus trade-offs.
- .ai/rules: invariantes obrigatórias para implementação.
- design-system: direção visual e tokens.
- docs/security: modelo de ameaças, dados e controles.
- docs/payments: contratos, estados, webhooks e reconciliação.

## Direção atual

A aplicação evoluirá como modular monolith Laravel + React, com Storefront e Admin separados, banco compartilhado com isolamento por tenant e integrações externas atrás de adapters.

Antes de reestruturar pastas de código, criar ADR contendo mapa de módulos, dependências permitidas, sequência de migração e estratégia para imports legados. Não fazer reorganização massiva junto de correções funcionais.
