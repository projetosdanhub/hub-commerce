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


### 2026-09-05 — Codex
- Objetivo e escopo: iniciar a padronização do menu Pixel, incluindo painel, integrações, acionadores e os diálogos relacionados.
- Branch: `ui/pixels-interface-standards`.
- Task board: UI-016 e UI-017 concluídos; UI-018 iniciado.
- Evidências: o orquestrador agora evita eventos nativos simulados, usa cabeçalho e abas do DesignSystem e apresenta skeleton ou indisponibilidade sem métricas estimadas.
- Próxima ação única: aplicar o mesmo padrão aos submódulos Painel, Integrações e Acionadores e revisar seus contratos antes da PR.

### 2026-09-05 — Codex
- Objetivo e escopo: concluir a padronização do menu Pixel e suas abas Painel, Integrações e Data Layer.
- Branch e commit: `ui/pixels-interface-standards`; validação de CI pendente.
- Task board: UI-018 permanece `[~]` até Tests, E2E Tests e Security Scans concluírem e a PR ser integrada.
- Arquivos alterados: orquestrador do Pixel, Painel, App Store de integrações, eventos nativos, acionadores, editor, diálogos e estilos do DesignSystem.
- Evidências: não há métricas, eventos, status ou dados simulados; a interface usa skeleton/indisponibilidade, primitives compartilhadas, ícones Lucide, diálogo acessível, ações com sincronização pós-mutation e experiências de tabela desktop/cartões mobile.
- Próxima ação única: abrir PR e validar os três workflows obrigatórios antes do merge.

### 2026-09-05 — Codex
- Objetivo e escopo: corrigir o erro 500 de GET /api/admin/orders/metrics observado no painel local.
- Branch: fix/orders-metrics-enum-contract; validação pendente.
- Causa: o controller referenciava casos removidos do enum OrderStatus e ainda comparava valores escalares contra atributos convertidos em enum.
- Alterações: agregação tenant-scoped com os estados canônicos, teste de contrato do endpoint e desativação de retry automático da métrica para falhas 5xx; o usuário ainda pode tentar manualmente.
- Próxima ação única: abrir PR e validar Tests, E2E Tests e Security Scans.


### 2026-09-05 — Codex
- Objetivo e escopo: iniciar UI-019, padronizando refresh global, filtro de período, tooltips portaled, textos longos e sidebar; aplicação inicial no módulo Pedidos.
- Branch: `ui/global-refresh-period-filter`; validação pendente.
- Task board: UI-018 [x] corrigida após PR #39; UI-019 [~] até testes e CI verificarem a nova interação global.
- Arquivos alterados: shell admin desktop/mobile, provider de refresh, DateRangeFilter, Tooltip, TruncatedText, Pedidos, DesignSystem, regras e board.
- Evidências: o refresh usa React Query ativo ou registradores da rota; período mantém os parâmetros reais `startDate` e `endDate`; nenhum dado, métrica, notificação ou ação foi simulado.
- Riscos, bloqueios e itens não verificados: a validação visual em navegador e os workflows obrigatórios ainda serão executados; a vitrine continua um link real em nova aba no rodapé da sidebar.
- Próxima ação única: revisar o diff, executar a validação proporcional e abrir PR para os três workflows obrigatórios.


### 2026-09-05 — Codex
- Objetivo e escopo: iniciar UI-020 no módulo Pedidos e promover as interações aprovadas a padrões do DesignSystem: métricas, região estável, filtro de período, busca expansível, tooltips, diálogos e reembolso auditável.
- Branch e commit: `ui/orders-operational-patterns`; validação de CI pendente.
- Task board: UI-019 [x] com evidência da PR #41; UI-020 [~] até a validação de testes, CI e revisão visual.
- Arquivos alterados: padrões `DateRangeFilter`, `ExpandableSearch`, `ModalDialog`, `MetricDictionaryDialog` e `MetricPreferencesDialog`; Pedidos, DesignSystem, controller/rotas/modelos/migrations, testes, board e regras.
- Comportamento preservado: filtros de Pedidos continuam usando `startDate`/`endDate`; queries e permissões tenant-scoped são mantidas; nenhuma métrica operacional foi inventada.
- Evidências: revisão estática confirma tooltip portaled com tokens do painel, busca por número/cliente/e-mail/CPF, altura estável da região de dados, preferências por usuário+tenant e transições de cancelamento/reembolso. Tests, E2E Tests e Security Scans ainda não foram executados para esta branch.
- Riscos, bloqueios e itens não verificados: transferência/estorno é registro manual comprovado, não integração bancária. Cashback usa o ledger atualmente existente e precisa continuar sob a evolução de CRM-003 para eliminar a dívida do saldo legado no usuário global. Comprovantes novos são privados; comprovantes legados públicos permanecem apenas para compatibilidade e requerem migração posterior.
- Próxima ação única: abrir PR, acompanhar todos os checks obrigatórios e revisar Pedidos em 320/768/1024 px, teclado, zoom 200% e reduced motion antes de integrar.

### 2026-09-05 — Codex — UI-021, primeiro bloco
- Objetivo: corrigir caixas vazias/tooltip e consolidar interações compartilhadas antes dos novos fluxos de Pedidos.
- Branch: `ui/orders-refinement-block-1`, baseada na main `6a65e5b2f7aefa883e4a16b57ec1caf738999911` (PR #42 integrada).
- Alterações: Tooltip sem renderização visual; MetricCard sem botão de ajuda sem ação; textos completos com quebra; debounce de 350 ms em Pedidos; lifecycle compartilhado para diálogos de métricas/ações de Pedidos, scroll lock com sobreposição, foco e saída; CSS vidro/tema claro azul-marinho; controles nos shells mobile e desktop; refinamento dos painéis de métricas.
- Contratos preservados: nenhuma mudança de status, reembolso, crédito, cálculo financeiro, storage ou emissão. Query mantém tenant e parâmetros reais. Preferência de tema é apenas aparência local.
- Diagnóstico: `.hub-admin` no portal de Tooltip herda a altura do painel. API de Pedidos contém zeros fixos para benefícios VIP e preview NFE gera espelho provisório; correções de domínio ainda pendentes.
- Board: UI-021 [~]; UI-022 a UI-026 registram integralmente reembolso, personalização, cliente, documentos, fiscal, valores, método e animações restantes.
- Validação: primeira execução planejada `npm run test:ui:interactions`; resultado ainda não registrado neste commit. Não foram executados build, Vitest, E2E, testes PHP nem homologação visual. O usuário pediu pausa após o primeiro teste; não abrir PR/disparar workflows antes da continuação.
- Riscos: outros diálogos legados precisam adotar o lifecycle; sucesso de mutação ainda pode desmontar o diálogo diretamente; navegação/progresso ficam no UI-026. Base fiscal está documentada, não integrada.
- Próxima ação única: executar o teste direcionado de debounce/scroll lock, comunicar resultado e pausar aguardando a continuação do responsável.


### 2026-09-05 — Codex — UI-021, continuação
- Objetivo e escopo: concluir a fundação de interações globais de Pedidos e registrar a regra arquitetural de estoque pós-reembolso, sem alterar domínio de pedidos/estoque.
- Branch e commit: `ui/orders-refinement-block-1`, código em `0ca3f16ebf1974469063a734d9e9e93cb92c8a97`; documentação e board até `bf6ac1057f2b2e26000546e1894537b3e8d0e343`.
- Task board: UI-021 [~] — automação concluída; homologação visual em navegador ainda pendente. CAT-009 [ ] foi criado para o estoque de reembolso/quarentena; UI-022 inclui sua integração futura.
- Arquivos alterados: controles de tooltip/busca, lifecycle de diálogo, shells desktop/mobile, preferência de aparência, teste Node, AGENTS, regra operacional, README do DesignSystem, board e política de inventário.
- Contratos preservados: nenhuma transição de pedido, cálculo financeiro, crédito/cashback, storage, API, certificado ou saldo de estoque foi alterado. Preferência de tema continua local e não contém dado de negócio.
- Evidências: [Tests #243](https://github.com/projetosdanhub/hub-commerce/actions/runs/33999033758), [E2E #61](https://github.com/projetosdanhub/hub-commerce/actions/runs/33999033728) e [Security #61](https://github.com/projetosdanhub/hub-commerce/actions/runs/33999033769) concluíram com sucesso na PR #43. Tests executou `npm run test:ui`, incluindo `npm run test:ui:interactions`, e o build.
- Riscos, bloqueios e itens não verificados: a regra de estoque não foi implementada porque o serviço transacional CAT-003 e o estoque de reembolso CAT-009 ainda não existem. Reembolso financeiro sem recebimento físico não pode criar saldo. Outros diálogos legados continuam fora do lifecycle até seus blocos.
- Próxima ação única: acompanhar os checks da atualização documental na PR #43 e fazer merge somente se permanecerem verdes; a homologação visual segue registrada como pendência.


### 2026-09-06 — Codex — UI-022, auditoria e preparação de CI
- Objetivo: concluir exclusivamente o fluxo operacional de reembolso de Pedidos, sem avançar para documentos gerais, personalizações, fiscal ou resumo financeiro.
- Branch: `ui/orders-refund-completion`, commit de implementação `d8019e3b68a02f10ef0342f2609c56b1a8b7faf5`, baseada na main `e53d3a73630d3d61446cd1d266fd53bb667358b4`.
- Implementado: cancelamento da solicitação restaura somente o status de origem persistido, com lock transacional e histórico; nova solicitação fica oculta durante a análise; confirmação exige motivo, modalidade `TRANSFERENCIA` ou `CASHBACK` e 1–2 imagens JPEG/PNG de até 5 MB; imagens são reprocessadas, armazenadas em área privada tenant-scoped e oferecidas em prévia/download por URL assinada temporária.
- Contratos preservados: cancelamento direto continua restrito a `A_PAGAR`; reembolso financeiro não cria estoque; retorno físico permanece dependente de CAT-009; não há integração bancária simulada. Cashback continua dependente da evolução idempotente do ledger em PAY-009/CRM-003.
- Documentação: UI-022 marcado `[~]` no board. `AGENTS.md` e a regra operacional 14 já continham as regras globais vigentes e não exigiram alteração adicional.
- Validação: nenhuma CI foi iniciada nesta etapa, conforme protocolo do responsável. Testes de feature, build, Tests, E2E Tests, Security Scans e homologação visual ainda pendentes.
- Próxima ação única: abrir a PR exclusiva do UI-022, o que iniciará a CI; interromper o trabalho imediatamente após a abertura e aguardar aprovação explícita do responsável antes de qualquer merge.


### 2026-09-06 — Codex — UI-026, fundação de valores verificáveis
- Objetivo e escopo: substituir a fundação financeira legada do checkout sem criar frete, desconto ou pagamento fictício.
- Branch e commits: `orders-financial-snapshot`; base de snapshot até `35e3123`, endurecimento/precificação até `f01f362`, regras e board até `780ae6e`.
- Task board: UI-026 [~] — contrato financeiro e precificação server-side iniciados; checkout atômico ainda depende de cotação persistida e payment attempts.
- Arquivos alterados: migration/model de snapshot, `OrderFinancialSnapshotBuilder`, `CheckoutPricingService`, testes unitários, regra 15, índice de regras e board.
- Evidências: testes de unidade adicionados, mas nenhuma CI foi aberta ou executada nesta branch.
- Riscos, bloqueios e itens não verificados: o checkout legado ainda não pode ser integrado ao novo fluxo até existir cotação de frete tenant-scoped, expirada/verificável, e adapter de pagamento com idempotência. Gateway continua explicitamente indisponível; não há aprovação simulada.
- Próxima ação única: criar contrato persistido da cotação de frete, validar seu vínculo ao carrinho/endereço e então conectar o snapshot ao checkout.


### 2026-09-06 — Codex — UI-026, cotação persistida
- Objetivo e escopo: preparar a referência segura de frete para o checkout, sem chamar provider, cobrar, criar pedido ou aceitar preço do cliente.
- Branch e commit: `orders-financial-snapshot`, contrato de cotação até `f0d6e23`; board atualizado em `9b7593c`.
- Task board: UI-026 [~] — cotação tenant-scoped opaca possui token, fingerprints de carrinho/destino, expiração, invalidação e valor em centavos; adapter de cotação e checkout atômico seguem pendentes.
- Arquivos alterados: migration/model `CheckoutShippingQuote`, `CheckoutFingerprint`, resolver de cotação, teste de fingerprint, board e regra 15.
- Evidências: teste unitário adicionado; CI ainda não foi iniciada nesta branch.
- Riscos, bloqueios e itens não verificados: a tabela não cria cotação sozinha. Melhor Envio legado ainda precisa ser extraído para adapter tenant-scoped antes de qualquer rota pública de cotação. Nenhum valor de frete é aceito do frontend.
- Próxima ação única: extrair e testar adapter de cotação do Melhor Envio, sem fallback de preço, e persistir suas opções nesse contrato.


### 2026-09-06 — Codex — UI-026, adapter e configuração de frete
- Objetivo e escopo: iniciar a remoção segura do legado de cotação, mantendo a rota administrativa compatível e sem expor a cotação ao checkout público ainda.
- Branch e commits: `orders-financial-snapshot`; configuração tenant-scoped até `a7704b6`, adapter até `e9725cd`, teste até `6922161`, board até `1d15f9b`.
- Task board: UI-026 [~]; SHIP-001/002/004 [~]. Nenhum item concluído sem CI.
- Arquivos alterados: `AGENTS.md`, migration/model de ambiente, controller Melhor Envio, `MelhorEnvioRateAdapter`, teste unitário, board.
- Evidências: teste unitário do adapter criado; CI ainda não iniciada.
- Riscos, bloqueios e itens não verificados: a rota administrativa ainda não é o endpoint público de checkout. Falta criar a seleção/persistência de cada taxa retornada, validar package a partir do carrinho e completar o fluxo público com cotação opaca. Verificação de token permanece no controller e deve migrar junto com a configuração do App de logística.
- Próxima ação única: persistir taxas reais retornadas pelo adapter como `CheckoutShippingQuote`, vinculadas ao carrinho/endereço e expiração, antes de expor a seleção no checkout.


### 2026-09-06 — Codex — App Melhor Envio
- Objetivo e escopo: mover a seleção sandbox/produção e a credencial do Melhor Envio para o Centro de Apps, com isolamento por tenant e sem exibir segredo.
- Branch e commits: `orders-financial-snapshot`; API/rotas até `2d4a5e6`, interface até `59affc2`, regra até `4799472`.
- Task board: SHIP-001/002/004 [~]; UI-026 [~]. CI ainda não iniciada.
- Arquivos alterados: AppCenterController, rotas, ConfiguracoesPrincipal, regra 15 e handoff.
- Evidências: revisão estática; o formulário usa campo password, API responde apenas `credential_configured` e troca de ambiente sem novo token limpa a credencial anterior.
- Próxima ação única: testar e persistir opções reais retornadas pelo adapter como CheckoutShippingQuote.


### 2026-09-06 — Codex — Carrinho e checkout da Loja
- Objetivo e escopo: remover o carrinho, frete e totais fictícios da página de checkout e conectá-la ao carrinho real do storefront.
- Branch e commits: `orders-financial-snapshot`; passagem do carrinho em `461dff1`; remoção do fluxo fictício até `5f5cf4f`.
- Task board: UI-026 [~]; checkout público permanece bloqueado até cotação pública e gateway idempotente.
- Arquivos alterados: `app.jsx`, `PaginaCheckout.jsx` e handoff.
- Evidências: revisão estática; a página recebe `cartItems`, não calcula dinheiro localmente, não anuncia Purchase e não submete pedido legado.
- Próxima ação única: implementar endpoint público de cotação que monta volumes a partir do catálogo e persiste apenas opções reais do adapter.

### 2026-09-07 — Codex — UI-026, checkout verificável
- Objetivo e escopo: substituir o mock de /checkout por uma jornada pública clara e responsiva, sem valores, frete ou pagamento simulados.
- Branch e commits: ui/checkout-real-shipping-selection; base em 6382e5c; identidade tenant-scoped em 808834c; resumo verificado em 45bc7d8; CEP em d327449; interface em ebd353d e endereços salvos em 995638a.
- Task board: UI-026 [~] — conta de compra por tenant, CEP editável, cotação opaca e resumo relido no servidor foram implementados. Continua sem pagamento, cupom, payment_attempt, pedido atômico ou tela de conclusão.
- Arquivos alterados: migrations/modelos de conta e endereço da vitrine; controllers, FormRequests e serviços de sessão, CEP, resumo e endereço; rotas públicas; testes de feature; PaginaCheckout e componentes de checkout.
- Evidências: testes de feature foram adicionados para isolamento de e-mail por tenant, endereço padrão, CEP e resumo/tamper de cotação. Nenhum workflow foi executado ainda nesta branch.
- Riscos, bloqueios e itens não verificados: o token de sessão fica apenas em memória; pagamento continua indisponível e nenhum pedido é criado. Seleção de endereço foi entregue no checkout; o carrinho ainda não expõe a seleção antes da navegação para o checkout. Não há gateway, cupom de frete, payment_attempt, webhook, multi-moeda por produto ou tela pós-compra nesta entrega.
- Próxima ação única: abrir a PR do UI-026 e aguardar Tests, E2E Tests e Security Scans antes de integrar.


### 2026-09-07 — Codex — UI-027, carrinho com entrega verificável
- Objetivo e escopo: remover os valores de frete, cupom e total simulados do carrinho e reaproveitar apenas os contratos públicos já verificados de CEP, cotação persistida e resumo financeiro.
- Branch e commits: `ui/cart-delivery-selection`; implementação inicial até `d4ac978`, documentação até `1afb5de`.
- Task board: UI-027 [~]. UI-026 foi integrado na main pela PR #54 (`66b58e8`) com Tests, E2E Tests e Security Scans verdes.
- Implementado: carrinho coleta CEP e endereço editável, consulta cotações reais, permite selecionar somente token de cotação persistido e mostra subtotal/frete/total apenas no resumo reconstruído pelo servidor. O rascunho segue para o checkout somente como dado de UI e é revalidado lá.
- Contratos preservados: nenhuma cotação, preço, desconto ou total vindo do navegador é fonte de verdade; pagamento segue indisponível; não há cupom de teste nem frete grátis fictício.
- Riscos, bloqueios e itens não verificados: endereços salvos continuam no checkout após autenticação da conta da loja. Para exibi-los no carrinho é necessário um contrato de sessão de cliente adequado ao retorno à loja; cupons de produto/frete e benefícios precisam de um serviço server-side que consolide regra por produto, loja e cupom.
- Próxima ação única: executar CI da branch e corrigir apenas os erros encontrados antes de abrir a PR do UI-027.


### 2026-09-07 — Codex — Etapa 4, fundação de navegação de crescimento
- Objetivo e escopo: iniciar a reorganização de UI/UX de Marketing, Benefícios/Fidelidade, Clientes/VIP e Afiliados, sem habilitar dados, métricas, filtros ou ações simuladas.
- Branch: `ui/marketing-benefits-foundation`.
- Task board: BEN-001, UI-010, UI-028 e APP-001 permanecem `[~]`. A etapa 4 continua antes de pagamento (etapa 1), motor de benefícios (etapa 2) e moeda por produto (etapa 3).
- Implementado: a sidebar separa Clientes, Benefícios & VIP, Marketing, Afiliados e Pixels; `/admin/beneficios` centraliza Cupons, Hub Coins, Recompensas, Loja de Cupons e VIP em submenus; Marketing e Afiliados deixaram de montar os monólitos legados com dados hardcoded.
- Contratos preservados: não há leitura/escrita de cupom, saldo, recompensa, comissão, métrica ou filtro porque os endpoints tenant-scoped ainda não existem. VIP mantém somente o atalho ao perfil de Clientes; o cálculo segue bloqueado até BEN-004. Centro de Apps mantém as instalações reais já existentes.
- Arquivos alterados: regra 16 e índice de regras; task-board; AppShell/AdminNavigation; rota React; novos componentes Growth e CSS com tokens; superfícies Marketing/Afiliados substituídas.
- Validação pendente: revisão da API real do Centro de Apps, refatoração visual de Apps, testes de UI/build, e homologação em 320/768/1024 px, teclado, zoom 200%, claro/escuro e reduced motion. Nenhuma CI foi disparada nesta branch.
- Próxima ação única: concluir APP-001 usando apenas o catálogo de instalações retornado por `GET /api/admin/settings/apps`, sem anunciar gateways antes de seus adapters homologados.


### 2026-09-07 — Codex — Etapa 4, Centro de Apps operacional
- Objetivo e escopo: transformar a apresentação existente do Centro de Apps em catálogo operacional sem divulgar credenciais nem anunciar integrações de pagamento inexistentes.
- Branch: `ui/marketing-benefits-foundation`.
- Implementado: `GET /api/admin/settings/apps` retorna somente `environment` e `credential_configured` para Logística e Fiscal; a UI usa esses dados para cartões responsivos de instalação/configuração e deixa explícito que somente um ambiente fica ativo por aplicativo. Fiscal apresenta “Teste (homologação)” e Produção.
- Contratos preservados: token do Melhor Envio, token fiscal e senha de certificado não retornam na lista. Stripe, Mercado Pago, Pagar.me e PagBank não foram inseridos como cards porque ainda não possuem adapter, tentativa idempotente e webhook homologados.
- Teste adicionado: `AdminApiAuditTest::test_app_catalog_returns_only_safe_configuration_metadata` assegura estrutura segura da resposta e ausência de segredos.
- Próxima ação única: abrir a PR da Etapa 4 e validar Tests, E2E Tests e Security Scans antes de iniciar PAY-001.


### 2026-09-07 — Codex — Etapa 1, fundação segura de pagamentos
- Objetivo e escopo: iniciar PAY-001/PAY-002 após o merge da PR #56, sem conectar gateway, receber cartão, cobrar ou alterar o estado de pedido.
- Branch: `payments/secure-foundation`, criada do merge `d782fb5` da PR #56.
- Implementado: novo subdomínio `app/Domain/Payments` com contrato `PaymentGateway`, autorização tokenizada validada, resultado de iniciação e enum de status; migration/model `PaymentAttempt` tenant-scoped com valor em centavos, moeda, ambiente, referências seguras e idempotência única por tenant+gateway.
- Contratos preservados: dados brutos de cartão e tokens completos não são persistidos; tentativa não confirma pedido; não há adapter, credencial, endpoint público de pagamento, cobrança, webhook ou aprovação simulada.
- Teste adicionado: `PaymentAuthorizationTest` cobre valor positivo, moeda ISO e estados terminais/não terminais.
- Próxima ação única: criar o caso de uso atômico que revalida carrinho/endereço/cotação, persiste pedido+itens+endereço+snapshot e abre a tentativa idempotente sem chamar gateway.


### 2026-09-07 — Codex — Etapa 1, checkout atômico e idempotente
- Objetivo e escopo: concluir a fundação de pedido antes de qualquer adapter, tokenização de cartão, cobrança ou webhook.
- Branch: `payments/secure-foundation`, baseada no merge `d782fb5` da PR #56.
- Implementado: `CheckoutOrderCreator` revalida no servidor cliente ativo, carrinho/catalogo, endereço, cotação opaca e expiração; em uma transação grava pedido, itens, endereço, snapshot financeiro imutável e `payment_attempt` pendente. A cotação é invalidada somente após a persistência bem-sucedida.
- Idempotência e isolamento: chave UUID única por tenant+gateway; sua impressão inclui cliente, carrinho, endereço, cotação, gateway, ambiente e método. Uma repetição idêntica devolve o mesmo pedido; qualquer alteração, inclusive outro cliente da mesma loja, é recusada sem duplicar pedido ou tentativa.
- Testes adicionados: `CheckoutOrderCreatorTest` cobre persistência atômica, valor relido no servidor, repetição idêntica, alteração do carrinho e reutilização entre clientes.
- Contratos preservados: não há endpoint público, adapter, credencial, PAN/CVV, token de cartão, cobrança, confirmação de frontend ou alteração para pago. Estoque ainda não é reservado: ORD-003/CAT-003 continua dependência explícita antes de exposição ao checkout.
- Próxima ação única: revisar o diff e abrir a PR da fundação de pagamentos; aguardar Tests, E2E Tests e Security Scans antes de marcar PAY-001/PAY-002/PAY-003 como concluídos ou iniciar Stripe.


### 2026-09-07 — Codex — Refatoração da estrutura administrativa
- Priorização: Stripe foi pausado antes de qualquer adapter por solicitação do responsável.
- Branch: `refactor/admin-domain-structure`, criada da `main` após a PR #57.
- Diagnóstico: a árvore Admin possui entry points na raiz, pastas em português/inglês e cópias de domínios. A rota ativa ainda importa `AdminMarketing.jsx` e `AdminCarriers.jsx`; `Marketing/MarketingPrincipal.jsx` e `Logistica/Carriers/` são duplicações legadas.
- Decisão: ADR-0003 define uma pasta inglesa e um entry point canônico por domínio; sem reexports de compatibilidade e sem manter código duplicado.
- Board: ADM-ARC-001 iniciado; ADM-ARC-002 registra que Marketing ainda precisa de fracionamento real com contratos tenant-scoped.
- Próxima ação única: mover Transportadoras para `Carriers/CarriersPage.jsx`, renomear seus subdomínios em inglês, atualizar imports/rota e remover a cópia em `Logistica/Carriers`.

### 2026-09-07 — Codex — Normalização estrutural completa do Admin
- Objetivo e escopo: remover duplicações e caminhos técnicos em português de `resources/js/Modulos/Admin`, sem avançar em Stripe ou alterar contratos de negócio.
- Branch: `refactor/admin-domain-structure`.
- Implementado: entradas canônicas por domínio (`<Domain>Page.jsx`) e uma única pasta inglesa para Dashboard, Orders, Products, Customers, Affiliates, Reviews, Marketing, Carriers, Categories, Navigation, Settings, StorefrontBuilder e Pixels; `AppShell`, `Authentication` e `Shared` também foram organizados. As rotas em `app.jsx` foram atualizadas junto de cada movimento.
- Duplicações removidas: raízes `Admin*.jsx`, Marketing monolítico, `Produtos`, `Pedidos`, `Logistica`, CRM legado, caminhos `Compartilhado` e subpastas em português de Pixels, Vitrine e Carriers. A implementação ativa de Customers/Orders/Products foi preservada; Marketing continua em estado operacional até contratos tenant-scoped.
- Auditoria: varredura de 133 módulos JS confirmou zero imports para os caminhos administrativos removidos; um import de produto e um reexport de tooltip foram corrigidos durante a revisão.
- Validação pendente: abrir PR, executar build/Tests/E2E/Security e homologar as rotas administrativas. Só após os gates verdes, marcar ADM-ARC-001 como concluído e retomar PAY-004/Stripe sandbox.
- Próxima ação única: revisar o diff estrutural e abrir a PR da refatoração; pausar após o início da CI.


### 2026-09-07 — Codex — Regras comerciais de frete
- Objetivo e escopo: iniciar regras tenant-scoped de frete grátis por produto/loja e desconto percentual, sempre calculadas no servidor e registradas no snapshot financeiro.
- Branch: `benefits/shipping-rules`.
- Task board: BEN-002 `[~]` — fundação de benefício de frete iniciada; cupom persistido, regras por região/valor e UI administrativa global permanecem pendentes.
- Arquivos alterados: migration/model/resolvedor de regras de frete; checkout summary/order creator; contrato, validação e editor de produto; teste unitário.
- Evidências: `ShippingBenefitResolverTest` adicionado. CI ainda não foi disparada, pois a entrega está em composição e sem PR aberta.
- Riscos, bloqueios e itens não verificados: o produto pode ser marcado para frete grátis; o benefício somente vale se todos os itens do carrinho forem elegíveis. A tela para regra global/percentual, cupom de frete após endereço e a regra de moeda/frete internacional ainda não foram implementadas. Nenhuma cobrança ou gateway foi habilitado.
- Próxima ação única: concluir a API e a UI de regras de frete no hub Benefícios, depois aplicar a apresentação no carrinho.


### 2026-09-07 — Codex — Frete grátis centralizado
- Objetivo e escopo: corrigir o conflito de carrinho misto e centralizar a gestão de produtos elegíveis, além de iniciar frete grátis por valor mínimo da compra.
- Branch: `benefits/shipping-rules`, PR #59 draft.
- Task board: BEN-002 `[~]` — seleção central de produtos e regra de valor mínimo iniciadas; cupom de frete após endereço, percentual configurável, progresso no carrinho e APIs/UI de Marketing seguem pendentes.
- Implementado: Produtos ganhou a aba Frete grátis; a seleção atualiza o tenant inteiro de forma atômica e não é alterada pela edição comum de produto. Regra por produto só concede frete grátis se todos os itens forem elegíveis; carrinho misto mostra frete. A regra por valor mínimo é resolvida no servidor após a cotação.
- Evidências: `ShippingBenefitResolverTest` cobre elegibilidade e não sobreposição inicial. CI ainda não iniciou para o HEAD atual.
- Riscos, bloqueios e itens não verificados: o indicador animado de quanto falta no carrinho, cupom de frete após endereço e a tela de regra percentual ainda não foram implementados. Nenhum gateway/pagamento foi habilitado.
- Próxima ação única: expor o progresso de frete grátis no contrato de resumo e renderizá-lo no carrinho com movimento reduzível.


### 2026-09-07 — Codex — Stripe por tenant, sem chaves reais
- Objetivo e escopo: preparar o app Stripe para Sandbox e Produção por loja, com adapter HTTP, credenciais criptografadas e testes simulados; não expor checkout, webhook ou aprovação local.
- Branch: `payments/stripe-tenant-configuration`.
- Task board: PAY-004 e PAY-011 permanecem `[~]`. PAY-007/PAY-008 continuam pendentes; nenhum pagamento pode ser confirmado nesta entrega.
- Implementado: Centro de Apps passou a exibir Stripe; cada tenant pode registrar, sem retorno pela API, chave publicável, chave secreta e segredo de webhook separados para Sandbox e Produção. O adapter recebe só PaymentMethod tokenizado, valor relido em centavos, moeda ISO e chave de idempotência; ausência de credencial ou falha externa resulta em indisponibilidade segura.
- Testes: `StripeGatewayTest` usa `Http::fake()` para simular PaymentIntent nos dois ambientes e confirma que até uma resposta `succeeded` permanece `PENDING` localmente. A auditoria da API impede a serialização de segredos.
- Riscos e bloqueios: chaves reais ainda não foram configuradas; a validação externa, tokenização oficial no navegador, endpoint público protegido, webhook assinado/idempotente, estoque e reconciliação seguem pendentes. O Stripe não deve ser marcado como pronto para cobrança.
- Próxima ação única: executar CI da branch e corrigir apenas os erros; após os gates verdes, iniciar PAY-007 (webhook Stripe assinado e idempotente) antes de liberar checkout.
