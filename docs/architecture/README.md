# Arquitetura do HUB Commerce

A documentação arquitetural descreve o estado aprovado, não apenas intenções.

## Índice

- docs/adr/0001-modular-monolith.md: arquitetura implantável aprovada.
- docs/architecture/domain-map.md: propriedade e colaboração entre módulos.
- docs/architecture/dependency-rules.md: dependências permitidas e proibidas.
- docs/architecture/api-contract.md: envelopes, códigos HTTP e códigos de erro estáveis.
- .ai/rules: invariantes obrigatórias para implementação.
- docs/security: modelo de ameaças, dados e controles.
- docs/payments: contratos, estados, webhooks e reconciliação.
- docs/ui: implementação do design system.

## Direção atual

A aplicação evoluirá como modular monolith Laravel + React, com Storefront e Admin separados por contrato e bundle. A decisão detalhada de multitenancy será formalizada na Fase 3.

Antes de reestruturar pastas de código, seguir a ADR-0001, o mapa de domínios, as regras de dependência e a sequência do task-board. Não misturar reorganização massiva, correção funcional e mudança de banco no mesmo commit.
