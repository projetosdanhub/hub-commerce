# Handoff entre agentes de IA

Este arquivo mantém a continuidade operacional entre KIA, Codex, Claude, Gemini e qualquer outro agente autorizado. Atualize-o no mesmo PR da mudança relevante; ele não substitui o histórico do Git nem o `task-board.md`.

## Estado atual

- **Objetivo:** modernizar as telas internas por módulo, preservando contratos de negócio e fluxos auditáveis.
- **Última integração:** `chore/ai-ui-standards-cleanup-node24`, squash commit `6aaa4e17a6dc0fc4a94af0c927061c7138462fcd` na `main`.
- **Branch de trabalho:** `ui/catalog-interface-standards`, padronização de controls, shell e Produtos em validação.
- **Tarefas afetadas:** UI-008, UI-007 e UI-009 concluídas; UI-004/UI-006/UI-011/UI-013 seguem em andamento pela migração incremental. CAT-002 e MKT-001 a MKT-003 continuam pendentes.
- **Próxima ação:** validar a padronização de Produtos; depois aplicar o mesmo catálogo canônico a Pedidos e Clientes/CRM.

## Modelo obrigatório

Copie este bloco para cada handoff relevante:

```md
### AAAA-MM-DD — <agente>
- Objetivo e escopo:
- Branch e commit:
- Task board: <ID> <[ ]/[~]/[x]/[!]> — motivo:
- Arquivos alterados:
- Evidências: <comando/executado + resultado; URL de run/PR quando existir>
- Riscos, bloqueios e itens não verificados:
- Próxima ação única:
```

## Regras de interpretação

1. `task-board.md` é a fonte de status; o handoff explica a evidência que sustenta o status.
2. `[x]` exige código, teste adequado e execução verde; um placeholder, um arquivo de configuração ou uma declaração não bastam.
3. `[!]` é obrigatório para dependências externas sem prova verificável, como proteção de branch, permissões e rotação de segredos.
4. Nunca declare um teste, build, deploy ou configuração externa como concluído sem registrar a evidência correspondente.
5. Outro agente deve ler este arquivo, `AGENTS.md`, `.ai/README.md` e as regras específicas antes de modificar o repositório.

### 2026-09-04 — Codex
- Objetivo e escopo: encerrar BASE-012, BASE-013 e BASE-014; remover o submódulo de UI quebrado; padronizar handoff e CI.
- Branch e commit: `baseline/close-quality-gates`, código validado em `ef093924bf65543433bfbf4a26cf289b4855cc5b`.
- Task board: BASE-012 [x], BASE-013 [x], BASE-014 [x]. QA-001 a QA-011 foram corrigidos para não declarar como concluído o que não possui evidência.
- Arquivos alterados: limites de paginação, CustomerController, README, regras de IA, workflows, Playwright, board e testes associados.
- Evidências: [Tests #223](https://github.com/projetosdanhub/hub-commerce/actions/runs/33868888328), [E2E #49](https://github.com/projetosdanhub/hub-commerce/actions/runs/33868888334) e [Security #49](https://github.com/projetosdanhub/hub-commerce/actions/runs/33868888326) concluíram com sucesso.
- Riscos, bloqueios e itens não verificados: QA-002/004/008 possuem dívida legada explicitamente registrada; QA-007, QA-009 e QA-010 não foram falsamente concluídos; SEC-002 e QA-011 dependem de evidência externa.
- Merge concluído: PR #19 integrado ao `main` no squash commit `80914396530fb11ed18f751dfb9cf23dc52f11e9`.
- Próxima ação única: iniciar UI-001 quando o responsável confirmar o escopo visual.


### 2026-09-04 — Codex
- Objetivo e escopo: substituir a fundação visual do admin por design system dark/glass, shell desktop, composição móvel independente, dashboard de dados reais e atualização de cache após publicar a vitrine.
- Branch e commit: `ui/admin-foundation`; código validado em `c9a27368ad3353749e2e659cef4e0e66aed1c413`.
- Task board: UI-001, UI-002, UI-003, UI-004, UI-005, UI-006, UI-011 e UI-013 em `[~]`; a fundação está entregue, mas a migração das telas legadas ainda é incremental.
- Arquivos alterados: tokens e estilos globais, primitives, `AdminLayout`, shells desktop/móvel, `AdminDashboard`, cliente React Query, construtor de vitrine, ESLint e task board.
- Evidências: [Tests #229](https://github.com/projetosdanhub/hub-commerce/actions/runs/33873995713), [E2E #55](https://github.com/projetosdanhub/hub-commerce/actions/runs/33873995734) e [Security #55](https://github.com/projetosdanhub/hub-commerce/actions/runs/33873995673) concluíram com sucesso.
- Riscos, bloqueios e itens não verificados: módulos legados continuam com estilos inline, SVGs próprios e componentes grandes; não foram removidos para evitar regressão de regras de catálogo, CRM, pedidos e pagamentos. A busca global está sinalizada como futura, sem comportamento falso.
- Próxima ação única: modernizar a tela de Pedidos a partir dos primitives canônicos e de dados React Query.

### 2026-09-04 — Codex
- Objetivo e escopo: substituir a tela interna de Pedidos por uma composição dark/glass modular, desktop e mobile, sem alterar contratos ou regras de negócio.
- Branch e commit: `ui/orders-experience`; código validado em `57126096908650e878d9336332372b8bb38c8d7b`.
- Task board: UI-008 `[x]` — lista, métricas, detalhe, diálogos operacionais e camada de API foram separados; ORD-004 e SHIP-001 a SHIP-005 continuam pendentes.
- Arquivos alterados: `AdminOrders`, módulos `Orders/*`, cache React Query, estilos do painel, task board e este handoff.
- Evidências: [PR #22](https://github.com/projetosdanhub/hub-commerce/pull/22); [Tests #231](https://github.com/projetosdanhub/hub-commerce/actions/runs/33876456702), [E2E #57](https://github.com/projetosdanhub/hub-commerce/actions/runs/33876456707) e [Security #57](https://github.com/projetosdanhub/hub-commerce/actions/runs/33876456832) concluíram com sucesso.
- Riscos, bloqueios e itens não verificados: a tela consome os contratos atuais de pedido e logística; não altera a idempotência, o isolamento por tenant ou a integração de produção do Melhor Envio. Essas pendências de domínio são deliberadamente mantidas no board.
- Próxima ação única: migrar Clientes/CRM depois do merge desta PR.


### 2026-09-04 — Codex
- Objetivo e escopo: modernizar Clientes/CRM com dados e ações reais, sem simulações.
- Branch e commit: `ui/customers-crm-experience`; integrado no squash commit `5edb1beb6c365da09832550372a14cb3a7ff3175`.
- Task board: UI-007 [x] e UI-009 [x] — evidência aprovada.
- Arquivos alterados: AdminCustomers, módulos Customers, query client, estilos do painel e task board.
- Evidências: [PR #23](https://github.com/projetosdanhub/hub-commerce/pull/23); [Tests](https://github.com/projetosdanhub/hub-commerce/actions/runs/33896829001), [E2E](https://github.com/projetosdanhub/hub-commerce/actions/runs/33896829086) e [Security](https://github.com/projetosdanhub/hub-commerce/actions/runs/33896829101) concluíram com sucesso.
- Riscos, bloqueios e itens não verificados: pendências de domínio CRM continuam abertas conforme board; nenhuma foi marcada como concluída pela migração visual.
- Próxima ação única: modernizar Catálogo com contratos de produto existentes.

### 2026-09-04 — Codex
- Objetivo e escopo: modernizar painel, diretório e auditoria de Catálogo com dados reais e cache tenant-aware.
- Branch e commit: `ui/catalog-experience`; integrado no squash commit `1ab4d9619b60000e9380c39b4212b97d8d01eb6e`.
- Task board: UI-007 [x] e UI-009 [x] registrados; CAT-002 permanece [ ].
- Arquivos alterados: ProdutosPrincipal, módulos Products de painel/lista/auditoria/API, query client, estilos e task board.
- Evidências: [PR #24](https://github.com/projetosdanhub/hub-commerce/pull/24); [Tests](https://github.com/projetosdanhub/hub-commerce/actions/runs/33898498617), [E2E](https://github.com/projetosdanhub/hub-commerce/actions/runs/33898498397) e [Security](https://github.com/projetosdanhub/hub-commerce/actions/runs/33898498605) concluíram com sucesso.
- Riscos, bloqueios e itens não verificados: métricas de vendas/receita não foram exibidas por não existir contrato real. Marketing, Afiliados e Avaliações ainda usam dados simulados legados e não podem ser conectados antes de contratos administrativos tenant-scoped.
- Próxima ação única: substituir o shell do editor de produto e alinhar uploads ao contrato do backend.

### 2026-09-04 — Codex
- Objetivo e escopo: modernizar o shell do editor de produto e remover comportamento simulado do fluxo de persistência.
- Branch e commit: `ui/catalog-editor-experience`; integrado no squash commit `63972bca34d09336805502a9d141f3040f0c57fb`.
- Task board: UI-004/UI-006/UI-011/UI-013 permanecem [~]; nenhum item foi marcado como concluído nesta etapa.
- Arquivos alterados: ProductEditor, catalogApi, AdminProducts, AbaMidia, admin.css, AGENTS.md e este handoff.
- Evidências: [PR #25](https://github.com/projetosdanhub/hub-commerce/pull/25); [Tests](https://github.com/projetosdanhub/hub-commerce/actions/runs/33900910008), [E2E](https://github.com/projetosdanhub/hub-commerce/actions/runs/33900910138) e [Security](https://github.com/projetosdanhub/hub-commerce/actions/runs/33900909918) concluíram com sucesso.
- Riscos, bloqueios e itens não verificados: abas internas legadas ainda possuem estilos inline e ícones próprios; a nova camada preserva seus campos e o payload. Marketing, Afiliados e Avaliações exigem remoção de mocks e contratos tenant-scoped antes de qualquer UI conectada.
- Próxima ação única: migrar visualmente a aba Geral do editor sem alterar o contrato de produto.


### 2026-09-04 — Codex
- Objetivo e escopo: substituir a aba Geral do editor de produto por componentes canônicos, sem valores, personas, SKU ou métricas simuladas.
- Branch e commit: `ui/catalog-editor-general-media`; integrado no squash commit `2477fe0d2398656fa3aa4f62a059393faf0d18d1`.
- Task board: UI-004/UI-006/UI-011/UI-013 continuam [~]; não há conclusão antecipada.
- Arquivos alterados: ProductGeneralForm, ProductEditor, AbaGeral como adaptador compatível e admin.css.
- Evidências: revisão estática confirmou ausência de mock, simulação, geração aleatória, HTML inseguro e estilos inline nos arquivos novos/substituídos; [PR #27](https://github.com/projetosdanhub/hub-commerce/pull/27), [Tests](https://github.com/projetosdanhub/hub-commerce/actions/runs/33901869175), [E2E](https://github.com/projetosdanhub/hub-commerce/actions/runs/33901869187) e [Security](https://github.com/projetosdanhub/hub-commerce/actions/runs/33901869198) concluíram com sucesso.
- Riscos, bloqueios e itens não verificados: abas Mídia, Estoque, Variações, Fiscal, Logística, SEO e Ficha Técnica ainda aguardam migração visual. Marketing, Afiliados e Avaliações continuam bloqueados por contratos reais tenant-scoped.
- Próxima ação única: migrar visualmente a aba Mídia, sem inventar remoções que o contrato de upload não suporte.


### 2026-09-04 — Codex
- Objetivo e escopo: substituir a aba Mídia do editor de produto por uma composição canônica e responsiva, alinhada aos limites reais de upload.
- Branch e commit: `ui/catalog-editor-media`; integrado no squash commit `b9034d8e6b3dcac20fbec6ba2ef28194b9d48994`.
- Task board: UI-004/UI-006/UI-011/UI-013 continuam [~]; não há conclusão antecipada.
- Arquivos alterados: ProductMediaForm, ProductEditor, AbaMidia como adaptador compatível e admin.css.
- Evidências: revisão estática confirma ausência de mock, simulação, geração aleatória, HTML inseguro, `alert`, ícones legados e estilos inline na nova aba; [PR #29](https://github.com/projetosdanhub/hub-commerce/pull/29), [Tests](https://github.com/projetosdanhub/hub-commerce/actions/runs/33902918244), [E2E](https://github.com/projetosdanhub/hub-commerce/actions/runs/33902918220) e [Security](https://github.com/projetosdanhub/hub-commerce/actions/runs/33902918236) concluíram com sucesso.
- Riscos, bloqueios e itens não verificados: imagem e vídeo principais podem ser substituídos, mas não removidos, pois o contrato atual não expõe remoção persistente desses arquivos. A remoção de galeria é mantida porque `galeria_urls` representa a lista final. Abas Estoque, Variações, Fiscal, Logística, SEO e Ficha Técnica ainda aguardam migração visual.
- Próxima ação única: migrar visualmente a aba Ficha Técnica, sem inventar atributos ou dados do produto.


### 2026-09-04 — Codex
- Objetivo e escopo: substituir a aba Ficha Técnica por componentes canônicos e responsivos, sem exemplos preenchidos ou atributos inventados.
- Branch e commit: `ui/catalog-editor-specification`; integrado no squash commit `2f55ea7f9d9ae6e781b45047d204ed8d0c5d52eb`.
- Task board: UI-004/UI-006/UI-011/UI-013 continuam [~]; não há conclusão antecipada.
- Arquivos alterados: ProductSpecificationForm, ProductEditor, AbaFichaTecnica como adaptador compatível e admin.css.
- Evidências: revisão estática confirma ausência de mock, simulação, exemplos, placeholders, geração aleatória, HTML inseguro, `alert`, ícones legados e estilos inline na nova aba; [PR #31](https://github.com/projetosdanhub/hub-commerce/pull/31), [Tests](https://github.com/projetosdanhub/hub-commerce/actions/runs/33903739028), [E2E](https://github.com/projetosdanhub/hub-commerce/actions/runs/33903738870) e [Security](https://github.com/projetosdanhub/hub-commerce/actions/runs/33903738820) concluíram com sucesso.
- Riscos, bloqueios e itens não verificados: a API aceita até 100 atributos e a interface respeita esse limite. Linhas incompletas são bloqueadas antes da gravação. Abas Estoque, Variações, Fiscal, Logística e SEO ainda aguardam migração visual.
- Próxima ação única: migrar visualmente a aba Estoque, sem inventar saldo, alertas ou previsão de reposição.


### 2026-09-04 — Codex
- Objetivo e escopo: substituir a aba Estoque por componentes canônicos e responsivos, preservando somente saldo, alerta mínimo e pré-venda persistidos.
- Branch e commit: `ui/catalog-editor-stock`; integrado no squash commit `e213b0ab3de138d7682ac55c294a5741aa359d1b`.
- Task board: UI-004/UI-006/UI-011/UI-013 continuam [~]; não há conclusão antecipada.
- Arquivos alterados: ProductInventoryForm, ProductEditor, AbaEstoque como adaptador compatível, produtoContract, AdminProducts e admin.css.
- Evidências: revisão estática confirma ausência de mock, simulação, fallback fictício, geração aleatória, HTML inseguro, `alert`, ícones legados e estilos inline na nova aba. O valor persistido `0` não é substituído por `5`; [PR #33](https://github.com/projetosdanhub/hub-commerce/pull/33), [Tests](https://github.com/projetosdanhub/hub-commerce/actions/runs/33904620965), [E2E](https://github.com/projetosdanhub/hub-commerce/actions/runs/33904620999) e [Security](https://github.com/projetosdanhub/hub-commerce/actions/runs/33904620988) concluíram com sucesso.
- Riscos, bloqueios e itens não verificados: a interface não exibe previsão de reposição, métricas ou disponibilidade inventada. Abas Variações, Fiscal, Logística e SEO ainda aguardam migração visual.
- Próxima ação única: migrar visualmente a aba Variações, sem gerar combinações automáticas sem dados informados.


### 2026-09-04 — Codex
- Objetivo e escopo: criar padrão reutilizável para outras IAs de UI/UX, SEO, desempenho e mobile; auditar notificações; remover artefatos legados sem consumidores; fixar a versão local do Node.
- Branch e commit: `chore/ai-ui-standards-cleanup-node24`; código/documentação em validação até `deaf2c10e26edaaced36ee59d23622b01668e284`.
- Task board: UI-015 [!] criada — centro de notificações exige contrato real tenant-scoped; sem badge, sino ou feed simulado. UI-004/UI-006/UI-011/UI-013 permanecem [~].
- Arquivos alterados: AGENTS.md, README, .nvmrc, regra 12, brief e checklist de UI/UX, board; removidos regras_layout.md e artisan_commands.txt.
- Evidências: workflows já utilizam Node 24; `.nvmrc` fixa Node 24 para desenvolvimento; [Node.js](https://nodejs.org/en/about/previous-releases) classifica v24 como LTS; [Vite 8](https://vite.dev/blog/announcing-vite8) exige Node 20.19+ ou 22.12+. Busca de código não encontrou consumidores para os dois artefatos removidos. Revisão estática confirmou índices e regras conectados; CI não é aplicável a esta alteração documental/configuração local.
- Riscos, bloqueios e itens não verificados: não há contrato administrativo tenant-scoped de notificações, logo nenhuma UI conectada foi criada. Dependências sem referência direta não foram removidas porque isso exige regenerar e validar package-lock de forma reproduzível.
- Próxima ação única: abrir PR, revisar o diff de governança/limpeza e iniciar Variações somente após o merge.


### 2026-09-05 — Codex
- Objetivo e escopo: estabelecer o padrão reutilizável de interface antes de continuar novos módulos, aplicando-o primeiro a Produtos e aos shells desktop/mobile.
- Branch e commit: `ui/catalog-interface-standards`, última revisão em `85826d48aec365acf8d74811d518c2f368298449`.
- Task board: UI-005, UI-006, UI-011, UI-013 e UI-014 permanecem [~]; primitives, tabs, filtros, métricas e documentação foram avançados, mas a aplicação aos módulos existentes é incremental.
- Arquivos alterados: tokens e CSS do design system; Button, IconButton, IconLink, Tooltip, Skeleton, FilterButton, FilterSelect, MetricCard, SectionTabs; shells; catálogo e editor; regra 06, board e README do DesignSystem.
- Evidências: revisão estática do diff confirma uso de Lucide, tokens e dados de catálogo retornados pela API. O alerta de estoque deixa de usar o fallback fictício de 5 unidades. Busca global, estado “Painel conectado” e ações sem contrato não são exibidos.
- Riscos, bloqueios e itens não verificados: notificações persistentes continuam bloqueadas em UI-015 sem contrato tenant-scoped. As ações de visualizar/excluir foram padronizadas como primitive, mas não são renderizadas no catálogo por falta de fluxo/autoridade real. Checks do PR ainda precisam concluir.
- Próxima ação única: acompanhar a validação do PR; após integração, aplicar este catálogo aos módulos já modernizados, começando por Pedidos.


### 2026-09-05 — Codex
- Objetivo e escopo: concluir todas as abas internas de Produtos no padrão canônico, sem dados simulados e com comportamento mobile próprio.
- Branch e commit: `ui/catalog-interface-standards`; validação final pendente deste commit.
- Arquivos alterados: editor de produtos, Variações, Fiscal, Logística, SEO, contrato e persistência de variações, design system e adaptadores legados.
- Evidências: as abas usam primitives/tokens, a prévia de busca depende de domínio canônico real e não simula dados. O envio de `variaveis_json` é sempre explícito, permitindo persistir a remoção da última variação.
- Riscos, bloqueios e itens não verificados: a prévia de SEO permanece indisponível até existir domínio canônico tenant-scoped; não há nova UI de notificações sem contrato de backend.
- Próxima ação única: aguardar os checks de PR e integrar na `main`; iniciar Pedidos na sequência.

### 2026-09-05 — Codex
- Objetivo e escopo: iniciar a padronização visual de Pedidos e criar o playbook obrigatório para IAs que alteram UI.
- Branch e commit: `ui/orders-interface-standards`; validação pendente deste commit.
- Task board: UI-016 foi iniciado; UI-005/UI-006/UI-011/UI-013/UI-014 permanecem [~]. UI-015 continua [!] por não haver contrato tenant-scoped de notificações.
- Arquivos alterados: lista e métricas de pedidos, acessibilidade do diálogo de ações, DesignSystem, regras e documentação de continuidade.
- Evidências: a lista continua usando as queries existentes, aplica filtros reais de status e período, preserva tabela desktop e cartões mobile. Métricas usam `MetricCard` e `Skeleton`; enquanto a API responde, nenhum zero estimado é mostrado. O diálogo controla foco, Escape e retorno de foco.
- Riscos, bloqueios e itens não verificados: o contrato atual de pedidos continua sem evidência de isolamento tenant-scoped; isso é uma pendência de domínio fora desta alteração visual. Notificações persistentes não foram criadas nem simuladas.
- Próxima ação única: abrir PR, validar Tests, E2E Tests e Security Scans; só então integrar e continuar para o próximo menu.

### 2026-09-05 — Codex
- Objetivo e escopo: iniciar a atualização completa do menu Clientes/CRM, incluindo painel, diretório, perfil 360º, benefícios VIP, configurações e diálogos.
- Branch e commit: `ui/customers-interface-standards`; validação pendente desta revisão.
- Task board: UI-017 iniciado. UI-005/UI-006/UI-011/UI-013/UI-014 continuam [~]; UI-015 permanece [!] sem contrato tenant-scoped de notificações.
- Arquivos alterados: AdminCustomers e módulos Customers, com reaproveitamento obrigatório de primitives/patterns do DesignSystem.
- Evidências: o dashboard passou a consumir somente as chaves reais de `getDashboardMetrics`; estados de carregamento e indisponibilidade não exibem zero ou configuração estimada. Lista, perfil e seções usam `SectionTabs`; diálogos controlam foco, Escape e retorno de foco.
- Riscos, bloqueios e itens não verificados: a interface preserva os contratos CRM atuais, que ainda possuem pendências de domínio e tenant registradas na Fase 6. Não foram criadas notificações persistentes, pessoas, métricas ou ações simuladas.
- Próxima ação única: abrir PR, validar Tests, E2E Tests e Security Scans e integrar somente após aprovação.
