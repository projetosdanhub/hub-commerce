# Arquitetura

Adotar modular monolith enquanto o domínio estiver em consolidação. Separar por capacidades de negócio, sem microserviços prematuros.

## Domínios previstos

Identity, Tenancy, Catalog, Customers, Orders, Inventory, Payments, Shipping, Storefront, Marketing, Tracking e Settings.

## Backend alvo

Cada domínio pode conter Actions, DTOs, Enums, Events, Jobs, Models, Policies, Queries e Services. Controllers recebem a requisição, autorizam, chamam uma Action e retornam Resource/Response. Integrações externas ficam atrás de interfaces e adapters.

## Frontend alvo

Separar Storefront e Admin em entradas ou chunks lazy-loaded. Dentro de cada aplicação, organizar por features. Componentes compartilhados devem ser realmente genéricos; regras de negócio pertencem à feature.

## Restrições

- Proibido adicionar lógica de negócio extensa em controllers ou componentes de página.
- Proibido importar módulos Admin na Storefront.
- Proibido acessar modelos de outro domínio para atalhar uma regra sem serviço/contrato explícito.
- Não criar classe, tabela ou componente duplicado em inglês/português para resolver conflito.
- Renomeações estruturais exigem inventário de imports, rotas, banco, filas e rollback.
- HTML de e-mail e documentos deve usar views/templates, nunca concatenação em controller.
- Configuração operacional deve vir de config/env ou banco por tenant, nunca booleano hardcoded.
