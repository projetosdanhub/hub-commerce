# Handoff entre agentes de IA

Este arquivo mantém a continuidade operacional entre KIA, Codex, Claude, Gemini e qualquer outro agente autorizado. Atualize-o no mesmo PR da mudança relevante; ele não substitui o histórico do Git nem o `task-board.md`.

## Estado atual

- **Objetivo:** modernizar as telas internas por módulo, preservando contratos de negócio e fluxos auditáveis.
- **Última integração:** `ui/catalog-editor-media`, squash commit `b9034d8e6b3dcac20fbec6ba2ef28194b9d48994` na `main`.
- **Branch de trabalho:** próxima migração visual do editor: aba Ficha Técnica.
- **Tarefas afetadas:** UI-008, UI-007 e UI-009 concluídas; UI-004/UI-006/UI-011/UI-013 seguem em andamento pela migração incremental. CAT-002 e MKT-001 a MKT-003 continuam pendentes.
- **Próxima ação:** migrar a aba Ficha Técnica sem alterar o contrato de produto.

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
- Branch e commit: `ui/catalog-editor-specification`; código em validação até `e9c6acb29f67c5bb23cb642fdfdf352059005736`.
- Task board: UI-004/UI-006/UI-011/UI-013 continuam [~]; não há conclusão antecipada.
- Arquivos alterados: ProductSpecificationForm, ProductEditor, AbaFichaTecnica como adaptador compatível e admin.css.
- Evidências: revisão estática confirma ausência de mock, simulação, exemplos, placeholders, geração aleatória, HTML inseguro, `alert`, ícones legados e estilos inline na nova aba; checks de CI ainda não executados.
- Riscos, bloqueios e itens não verificados: a API aceita até 100 atributos e a interface respeita esse limite. Linhas incompletas são bloqueadas antes da gravação. Abas Estoque, Variações, Fiscal, Logística e SEO ainda aguardam migração visual.
- Próxima ação única: abrir PR e executar Tests, E2E e Security.
