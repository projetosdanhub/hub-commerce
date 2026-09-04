# Governança para agentes de IA

Esta pasta contém o contrato operacional da KIA e de outros agentes que trabalham no HUB Commerce.

## Leitura obrigatória por tipo de tarefa

- Qualquer tarefa: AGENTS.md e 00-product-and-principles.md.
- Arquitetura ou reorganização: 01-architecture.md.
- Autenticação, dados, uploads ou APIs: 02-security.md.
- Qualquer entidade de negócio: 03-multitenancy.md.
- Laravel/PHP: 04-backend-laravel.md.
- React/UI: 05-frontend-react.md, 06-design-system.md e 12-ui-ux-seo-and-mobile.md.
- Checkout ou gateways: 07-payments.md.
- Schema ou migration: 08-database-and-migrations.md.
- Toda entrega: 09-testing-and-quality.md e 10-git-and-delivery.md.
- Comportamento do agente: 11-agent-operating-protocol.md.
- Continuidade entre agentes: agent-handoff.md.

## Estrutura

- rules: regras normativas e critérios de aceite.
- checklists: conferências antes de concluir uma mudança.
- templates: modelos para planos técnicos, incluindo o brief ui-ux-task-brief.md para delegação visual.
- docs/adr: decisões arquiteturais permanentes.

As regras são preventivas. Elas não afirmam que o código atual já está conforme. Ao encontrar código legado em desacordo, não replique o padrão inseguro: registre a dívida e proponha migração compatível.

## Continuidade e evidências

Antes de retomar uma tarefa, leia `.ai/agent-handoff.md`. O board é a fonte de status, mas deve apontar para evidências reais; não marque `[x]` por existir configuração, teste placeholder ou documentação sem execução verde. Controles externos (proteção de branch, rotação de segredo, permissões) permanecem `[!]` até que a evidência verificável esteja registrada.
