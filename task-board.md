# HUB Commerce — Task Board

Atualizado em: 2026-09-09 — Melhor Envio foi migrado da entrada manual de token para OAuth por instalação; Cofre mostra prontidão não secreta por ambiente.
Documento vivo: atualizar o status neste arquivo no mesmo commit da implementação.

## Segurança para repositório público — 2026-09-09

| Status | ID | Prioridade | Tarefa | Critério de aceite |
|---|---|---:|---|---|
| [x] | SEC-009 | P0 | Auditar e preparar o repositório para visibilidade pública | Sem arquivos sensíveis versionados; workflows somente em `pull_request`; permissões mínimas; fixtures de seeder sintéticas |
| [x] | CI-014 | P1 | Reexecutar Actions das PRs após mudança para público | PRs #69–#72 com checks verdes; sem bloqueio de cota |

Relatório detalhado: `docs/security/public-repository-readiness.md`.

## Legenda

- [ ] Pendente
- [~] Em andamento
- [x] Concluído e verificado
- [!] Bloqueado
- P0: bloqueia segurança ou produção
- P1: necessário para multitenancy/MVP
- P2: melhoria importante
- P3: evolução posterior

## Regras de uso

1. Trabalhar em uma tarefa por vez ou em um grupo pequeno explicitamente relacionado.
2. Uma tarefa só recebe [x] após código, testes e critérios de aceite.
3. Não pular dependências sem registrar uma ADR.
4. Toda entrega atualiza este board, os testes e a documentação afetada.
5. Itens novos devem receber ID estável; não renumerar itens existentes.

## Sequência autorizada — 2026-09-07

1. **Etapa 4 — fundação integrada:** navegação, submenus e estados honestos de Marketing, Benefícios/Fidelidade, Clientes/VIP, Afiliados e Apps foram entregues na PR #56. Filtros e métricas continuam bloqueados até cada domínio publicar sua consulta tenant-scoped; UI-028/UI-029 seguem para refinamentos posteriores.
2. **Etapa 1 — atual:** criar a fundação de pedido e pagamento — snapshot atômico, adapter, tentativa e idempotência.
3. **Etapa 2:** consolidar o motor de benefícios, cupom, Hub Coins, VIP e resgate para aplicá-los no carrinho e checkout com snapshot.
4. **Etapa 3:** habilitar moeda por produto e restringir USD/EUR ao Stripe configurado no tenant.

Cada etapa abre branch e PR próprios; a próxima só começa depois de evidência verde da anterior, salvo documentação de planejamento.

## Ativos de interface — 2026-09-08

| Status | ID | Prioridade | Tarefa | Dependência | Critério de aceite |
|---|---|---:|---|---|---|
| [x] | MEDIA-001 | P2 | Organizar logos WebP de gateways, meios de pagamento e transportadoras | — | Arquivos fora da raiz; variantes de gateway são exibidas nos cards por tema e os meios de pagamento/transportadoras ficam em subpastas sem duplicação |
| [x] | MEDIA-002 | P2 | Normalizar nomes e referências de logos por tema | MEDIA-001 | Variantes `-clean` e `-dark` consistentes nos cards; sem nomes ambíguos ou grafia incorreta |

## Segurança de operação — 2026-09-08

| Status | ID | Prioridade | Tarefa | Dependência | Critério de aceite |
|---|---|---:|---|---|---|
| [x] | UI-030 | P1 | Restaurar confirmação explícita para desinstalação de apps | UI-028 | Modal acessível confirma a intenção e bloqueia repetição durante a operação; Tests, E2E Tests e Security Scans verdes na PR #68 |

## Ambiente de desenvolvimento — 2026-09-09

| Status | ID | Prioridade | Tarefa | Critério de aceite |
|---|---|---:|---|---|
| [~] | DEV-DOCKER-001 | P1 | Substituir XAMPP pelo Docker local | Compose e documentação criados para Laravel, PostgreSQL, Redis, MinIO, Mailpit, assets compilados para túnel, proxy HTTPS confiável com config cache, API same-origin e Vite/HMR opt-in; pendem bootstrap local e validação dos serviços |
| [ ] | DEV-DOCKER-002 | P1 | Validar bootstrap no Docker | Build, migrations, seed, fila e testes executados sem XAMPP |

## Fase 0 — Governança e preparação

| Status | ID | Prioridade | Tarefa | Dependência | Critério de aceite |
|---|---|---:|---|---|---|
| [x] | GOV-001 | P0 | Criar contrato raiz para agentes | — | AGENTS.md versionado |
| [x] | GOV-002 | P0 | Criar regras por domínio | GOV-001 | .ai/rules indexado |
| [x] | GOV-003 | P1 | Criar checklists e template de mudança | GOV-002 | Checklists disponíveis |
| [x] | GOV-004 | P1 | Organizar documentação de arquitetura, segurança e pagamentos | GOV-002 | Estrutura docs criada |
| [x] | GOV-005 | P1 | Criar este task board | GOV-001 | Board versionado |
| [x] | GOV-006 | P1 | Remover regras e prompts antigos de layout | GOV-002 | Sem fontes normativas conflitantes |
| [x] | GOV-007 | P2 | Revisar arquivos scratch, brain e transcrições | GOV-006 | Artefatos removidos e padrões adicionados ao .gitignore |
| [x] | GOV-008 | P1 | Criar ADR do modular monolith | GOV-004 | ADR-0001 aprovada |
| [x] | GOV-009 | P1 | Criar mapa de domínios e dependências permitidas | GOV-008 | Mapa e regras documentados |

## Fase 1 — Contenção de segurança crítica

| Status | ID | Prioridade | Tarefa | Dependência | Critério de aceite |
|---|---|---:|---|---|---|
| [x] | SEC-001 | P0 | Separar configuração pública e privada de tracking | GOV-006 | Endpoint público usa whitelist e não retorna secrets |
| [!] | SEC-002 | P0 | Rotacionar tokens de tracking potencialmente expostos | SEC-001 | Runbook pronto; aguarda evidência verificável da revogação externa |
| [x] | SEC-003 | P0 | Exigir role/status administrativo no login | GOV-006 | Login exige admin + ATIVO |
| [x] | SEC-004 | P0 | Criar middleware e Policies administrativas | SEC-003 | Gate, Policy e middleware admin aplicados |
| [x] | SEC-005 | P0 | Adicionar throttle a login, reset, checkout e tracking | SEC-001 | Limites explícitos e teste de resposta 429 |
| [x] | SEC-006 | P0 | Implementar logout, expiração e revogação de tokens | SEC-003 | TTL 60 min, logout e teste de revogação |
| [x] | SEC-007 | P0 | Desativar aprovação fictícia de pagamentos | GOV-006 | Adapters mock retornam indisponível |
| [x] | SEC-008 | P0 | Remover PAN/CVV do frontend e backend | SEC-007 | UI removida e backend rejeita campos brutos |
| [x] | SEC-009 | P0 | Migrar documentos sensíveis para storage privado | GOV-006 | Novos uploads privados + comando de migração legado |
| [x] | SEC-010 | P0 | Criar download temporário autorizado | SEC-009 | Link gerado por admin, assinatura e vínculo validados |
| [x] | SEC-011 | P0 | Remover exposição de exceções e bodies externos | GOV-006 | Handler seguro e respostas externas normalizadas |
| [x] | SEC-012 | P1 | Criptografar credenciais em repouso | SEC-001 | Tracking, settings e Melhor Envio criptografados |
| [x] | SEC-013 | P1 | Impedir secrets serializados em jobs | SEC-012 | Jobs serializam destinationId |
| [x] | SEC-014 | P1 | Mascarar PII em logs e auditorias | SEC-009 | Redator central e tracking pseudonimizado |
| [x] | SEC-015 | P1 | Adicionar cabeçalhos HTTP de segurança | SEC-011 | Middleware e testes de headers |
| [x] | SEC-016 | P1 | Criar inventário LGPD e política de retenção | GOV-004 | Inventário e retenção documentados |

## Fase 2 — Baseline executável e integridade

| Status | ID | Prioridade | Tarefa | Dependência | Critério de aceite |
|---|---|---:|---|---|---|
| [x] | BASE-001 | P0 | Corrigir migrations fiscais duplicadas | GOV-006 | migrate:fresh funciona |
| [x] | BASE-002 | P0 | Definir estratégia segura para bancos já existentes | BASE-001 | Preflight, migration corretiva e rollback testados |
| [x] | BASE-003 | P0 | Unificar Product/Produto | BASE-001 | Model e imports únicos |
| [x] | BASE-004 | P0 | Unificar Category/Categoria | BASE-001 | Tabela, model e API consistentes |
| [x] | BASE-005 | P0 | Corrigir cinco imports React inexistentes | GOV-006 | Imports verificados e npm run build aprovado |
| [x] | BASE-006 | P0 | Corrigir rota /api/customers ou removê-la | BASE-003 | Nenhuma action inexistente |
| [x] | BASE-007 | P0 | Trocar busca pública para endpoint storefront | BASE-003 | Visitante pesquisa sem token admin |
| [x] | BASE-008 | P1 | Normalizar campos de preço, estoque e status | BASE-003 | Contrato único backend/frontend |
| [x] | BASE-009 | P1 | Criar enums e transições de status de pedido | BASE-008 | Sem mistura pending/paid e estados antigos |
| [x] | BASE-010 | P1 | Remover scripts manuais de schema da raiz | BASE-002 | Alterações somente por migrations |
| [x] | BASE-011 | P1 | Padronizar respostas e códigos HTTP da API | SEC-011 | Contrato de erro documentado |
| [x] | BASE-012 | P1 | Adicionar paginação e limites às listagens | BASE-011 | Limite centralizado (1–100), teste unitário e pipeline #223 verdes |
| [x] | BASE-013 | P2 | Eliminar N+1 e queries redundantes | BASE-012 | LTV/VIP em lote; código e pipeline #223 verificados |
| [x] | BASE-014 | P1 | Fazer PHP e frontend iniciarem por comandos documentados | BASE-005 | README, migrations e builds reproduzidos pelas pipelines #223 e #49 |

## Fase 3 — Fundação multitenant

| Status | ID | Prioridade | Tarefa | Dependência | Critério de aceite |
|---|---|---:|---|---|---|
| [x] | TEN-001 | P0 | Aprovar ADR da estratégia shared-schema | GOV-008 | Decisão e trade-offs aprovados |
| [x] | TEN-002 | P0 | Criar tenants | TEN-001 | Tenant possui UUID, status e configurações básicas |
| [x] | TEN-003 | P0 | Criar tenant_domains | TEN-002 | Domínio único e verificável |
| [x] | TEN-004 | P0 | Implementar TenantContext imutável | TEN-002 | Contexto disponível em request e jobs |
| [x] | TEN-005 | P0 | Resolver tenant por domínio | TEN-003 | Domínio inválido falha com segurança |
| [x] | TEN-006 | P0 | Adicionar tenant_id às entidades de negócio | TEN-004 | Backfill e constraints concluídos |
| [x] | TEN-007 | P0 | Aplicar escopo tenant a queries e route binding | TEN-006 | IDs de outro tenant não são encontrados |
| [x] | TEN-008 | P0 | Criar índices e unicidades compostas | TEN-006 | SKU, slug e cupom isolados; e-mail é identidade global |
| [x] | TEN-009 | P0 | Isolar configurações globais por tenant | TEN-006 | Sem registros fixos id=1 globais |
| [x] | TEN-010 | P0 | Isolar cache por tenant | TEN-004 | Keys prefixadas e testes negativos |
| [x] | TEN-011 | P0 | Isolar arquivos por tenant | TEN-006 | Prefixo tenants/{uuid} aplicado |
| [x] | TEN-012 | P0 | Propagar tenant em filas e eventos | TEN-004 | Job rejeita contexto ausente/inválido |
| [x] | TEN-013 | P1 | Isolar métricas e tracking | TEN-006 | Dashboard nunca mistura lojas |
| [x] | TEN-014 | P1 | Criar onboarding de nova loja | TEN-009 | Tenant nasce com defaults válidos |
| [x] | TEN-015 | P1 | Implementar suspensão e lifecycle do tenant | TEN-005 | Tenant suspenso não opera |
| [x] | TEN-016 | P1 | Criar suíte automatizada de isolamento | TEN-007 | Testes cruzados em toda API crítica |

## Fase 4 — Identidade, equipes e permissões

| Status | ID | Prioridade | Tarefa | Dependência | Critério de aceite |
|---|---|---:|---|---|---|
| [x] | IAM-001 | P0 | Separar usuário global, membership de plataforma e membership no tenant | TEN-002 | Usuário participa de múltiplas lojas e pode receber acesso interno de plataforma |
| [x] | IAM-002 | P0 | Definir matriz de cargos e permissões de plataforma e tenant | IAM-001 | Matriz documentada, incluindo delegação limitada e owner protegido |
| [x] | IAM-003 | P0 | Aplicar Policies por recurso e proteção do owner | IAM-002 | Permissões verificadas no backend; admin de loja não remove owner |
| [x] | IAM-004 | P1 | Implementar convite de equipe | IAM-002 | Convite expira e é de uso único |
| [x] | IAM-005 | P1 | Implementar recuperação de senha segura | SEC-005 | Tokens hash/TTL/uso único |
| [x] | IAM-006 | P1 | Implementar verificação de e-mail segura | IAM-001 | Link assinado e idempotente |
| [x] | IAM-007 | P1 | Implementar MFA para administradores | IAM-003 | MFA habilitável e recuperável |
| [x] | IAM-008 | P1 | Criar trilha de auditoria administrativa | IAM-003 | Ator, escopo de plataforma/tenant, ação e alvo registrados |
| [x] | IAM-009 | P2 | Criar sessões/dispositivos e revogação | SEC-006 | Usuário encerra sessões remotas |

## Fase 5 — Catálogo e estoque

| Status | ID | Prioridade | Tarefa | Dependência | Critério de aceite |
|---|---|---:|---|---|---|
| [ ] | CAT-001 | P1 | Consolidar modelo de categorias | BASE-004, TEN-006 | Hierarquia e slugs tenant-scoped |
| [ ] | CAT-002 | P1 | Consolidar produto e variações | BASE-003, TEN-006 | SKU e estoque consistentes |
| [ ] | CAT-003 | P1 | Criar serviço de estoque transacional | CAT-002 | Reserva/decremento atômicos |
| [ ] | CAT-004 | P1 | Implementar mídia por tenant | TEN-011 | Imagens otimizadas e autorizadas |
| [ ] | CAT-005 | P1 | Validar campos fiscais | BASE-008 | Regras e mensagens consistentes |
| [ ] | CAT-006 | P2 | Implementar importação/exportação de catálogo | CAT-002 | Processo assíncrono e auditado |
| [ ] | CAT-007 | P2 | Criar busca e filtros públicos | CAT-002 | Busca paginada e indexável |
| [ ] | CAT-008 | P2 | Criar alertas de estoque | CAT-003 | Alertas idempotentes por tenant |
| [ ] | CAT-009 | P1 | Criar estoque de reembolso/quarentena | CAT-003, ORD-004, PAY-009 | Pedido entregue nunca recompõe estoque vendável; retorno físico entra em estoque de reembolso por item/variante, com movimento tenant-scoped, idempotente e auditável; transferência ao normal é explícita |

## Fase 6 — Clientes, CRM e LGPD

| Status | ID | Prioridade | Tarefa | Dependência | Critério de aceite |
|---|---|---:|---|---|---|
| [ ] | CRM-001 | P1 | Isolar cadastro de cliente por tenant | TEN-008 | Mesmo e-mail permitido em lojas distintas |
| [ ] | CRM-002 | P1 | Normalizar perfil e endereços | CRM-001 | Dados reais substituem mocks |
| [~] | CRM-003 | P1 | Corrigir carteira, Hub Coins e cashback | BASE-009 | Fundação de domínio iniciada: ledger tenant-scoped, idempotência, auditoria e projeção de saldo; implementação depende de BEN-003 |
| [ ] | CRM-004 | P1 | Proteger alterações de CPF/e-mail/telefone | SEC-009, IAM-003 | Reautorização e comprovante privado |
| [ ] | CRM-005 | P1 | Criar consentimentos e preferências | SEC-016 | Consentimento versionado |
| [ ] | CRM-006 | P1 | Implementar exportação e exclusão LGPD | SEC-016 | Solicitação rastreável e segura |
| [~] | CRM-007 | P2 | Consolidar VIP e segmentação | CRM-001 | Arquitetura iniciada: critérios e benefícios tenant-scoped; cálculo e integração no checkout dependem de BEN-004 |
| [ ] | CRM-008 | P2 | Remover dados pessoais fictícios do frontend | CRM-002 | Nenhuma persona hardcoded em produção |

## Fase 7 — Carrinho, pedidos e pagamentos

| Status | ID | Prioridade | Tarefa | Dependência | Critério de aceite |
|---|---|---:|---|---|---|
| [ ] | ORD-001 | P1 | Conectar checkout ao carrinho real | BASE-005, CAT-002 | Itens vêm do estado real |
| [ ] | ORD-002 | P1 | Recalcular preços e promoções no servidor | CAT-002 | Cliente não controla total |
| [ ] | ORD-003 | P1 | Reservar estoque com concorrência segura | CAT-003 | Sem overselling |
| [ ] | ORD-004 | P1 | Criar máquina de estados do pedido | BASE-009 | Transições inválidas bloqueadas |
| [~] | ORD-005 | P1 | Exibir pagamento e mídia privada de personalização no pedido | SEC-009, TEN-006 | Implementado na PR #69: lista exibe somente a forma; detalhe separa gateway; mídia por item usa URL temporária autorizada e isolada por tenant. Validação CI bloqueada por jobs GitHub sem etapas/`BlobNotFound` em 2026-09-08 |
| [~] | DEV-001 | P2 | Criar dados locais de demonstração tenant-scoped | CAT-002, ORD-005 | Implementado na PR #69: catálogo tenant-scoped com e sem variações/personalização e pedidos com desconto/cupom; sem seed em produção. Validação CI bloqueada por jobs GitHub sem etapas/`BlobNotFound` em 2026-09-08 |
| [~] | PAY-001 | P0 | Criar PaymentGateway interface | SEC-007 | Contrato tokenizado e resultado de iniciação criados; a confirmação continua exclusiva de webhook assinado e aguarda CI |
| [~] | PAY-002 | P0 | Criar payment_attempts por tenant | PAY-001, TEN-006 | Migration/model tenant-scoped com valor em centavos, moeda, ambiente, referências seguras e chave idempotente; ainda sem cobrança ou adapter |
| [~] | PAY-003 | P0 | Implementar idempotência de checkout | PAY-002 | Caso de uso atômico criado: revalida cliente/carrinho/endereço/cotação, persiste pedido+snapshot+tentativa e devolve somente repetição idêntica; aguarda CI |
| [~] | PAY-004 | P1 | Integrar Stripe com tokenização oficial | SEC-008, PAY-003 | Adapter Stripe, credenciais criptografadas Sandbox/Produção e testes HTTP simulados entregues; falta homologação externa, endpoint público, tokenização no navegador e webhook assinado |
| [ ] | PAY-005 | P1 | Integrar Mercado Pago com tokenização oficial | SEC-008, PAY-003 | Sandbox aprovado |
| [ ] | PAY-006 | P1 | Integrar Pagar.me com tokenização oficial | SEC-008, PAY-003 | Sandbox aprovado |
| [ ] | PAY-007 | P0 | Implementar webhooks assinados e idempotentes | PAY-002 | Replay e assinatura testados |
| [ ] | PAY-008 | P1 | Sincronizar estados payment/order | PAY-007, ORD-004 | Webhook é fonte autoritativa |
| [ ] | PAY-009 | P1 | Implementar refund seguro | PAY-008, IAM-003 | Permissão, idempotência e auditoria |
| [ ] | PAY-010 | P1 | Criar reconciliação financeira | PAY-008 | Divergências identificadas |
| [~] | PAY-011 | P1 | Separar credenciais test/live por tenant | SEC-012, TEN-009 | Configuração Stripe mantém Sandbox/Produção separadas, criptografadas e validadas por prefixo; falta validação externa das chaves e bloqueio de deploy por ambiente |
| [ ] | PAY-012 | P1 | Revisar conformidade PCI e LGPD | PAY-004, PAY-005, PAY-006 | Nenhum dado bruto de cartão no HUB |

## Webhooks do Melhor Envio — 2026-09-09

| Status | ID | Prioridade | Tarefa | Critério de aceite |
|---|---|---:|---|---|
| [~] | APP-015 | P1 | Receber atualizações de etiquetas do Melhor Envio | Contrato oficial confirmado: endpoint é configurado no aplicativo, assinatura `X-ME-Signature` (HMAC-SHA256 sobre raw body), eventos `order.*`, retentativas do provedor. Endpoint público, validação HMAC, persistência/deduplicação e fila entregues; pendem testes automatizados, vínculo idempotente etiqueta→pedido e homologação Sandbox |
| [ ] | SHIP-008 | P1 | Homologar webhook Melhor Envio | Aplicativo Sandbox criado, URL pública cadastrada e eventos de etiqueta validados sem expor secrets |

## Fase 8 — Frete e logística

| Status | ID | Prioridade | Tarefa | Dependência | Critério de aceite |
|---|---|---:|---|---|---|
| [~] | SHIP-001 | P1 | Isolar remetente e Melhor Envio por tenant | TEN-009 | Em andamento: configuração deixou de usar id global; validar migração e cobertura tenant antes de concluir |
| [~] | SHIP-002 | P1 | Mover sandbox/produção para configuração | SHIP-001 | Em andamento: ambiente é persistido por tenant; validar migration e UI de configuração |
| [ ] | SHIP-003 | P1 | Validar cotação e dimensões | CAT-002 | Limites e erros normalizados |
| [~] | SHIP-004 | P1 | Criar adapter do Melhor Envio | SHIP-002 | Em andamento: cálculo foi extraído para adapter e possui teste unitário; falta integração pública e validação de CI |
| [ ] | SHIP-005 | P1 | Implementar etiqueta e rastreio idempotentes | SHIP-004 | Repetição não duplica envio |
| [ ] | SHIP-006 | P1 | Proteger romaneios e comprovantes | SEC-009 | Arquivos privados |
| [ ] | SHIP-007 | P2 | Consolidar transportadoras próprias | TEN-006 | Documentos e pedidos isolados |

## Fase 9 — Tracking, marketing e privacidade

| Status | ID | Prioridade | Tarefa | Dependência | Critério de aceite |
|---|---|---:|---|---|---|
| [ ] | TRK-001 | P0 | Validar e limitar payload de tracking | SEC-001, SEC-005 | Schema e tamanho máximo |
| [ ] | TRK-002 | P0 | Impedir disparos externos forjados | TRK-001 | Eventos confiáveis/autorizados |
| [ ] | TRK-003 | P1 | Isolar destinos e regras por tenant | TEN-013 | Credenciais e métricas separadas |
| [ ] | TRK-004 | P1 | Criar consent mode | SEC-016 | Tracking respeita preferência |
| [ ] | TRK-005 | P1 | Definir retenção e agregação de eventos | SEC-016 | Limpeza automatizada |
| [ ] | TRK-006 | P1 | Endurecer jobs CAPI | SEC-013 | Retry, timeout e failed definidos |
| [ ] | TRK-007 | P2 | Criar deduplicação browser/server | TRK-006 | event_id consistente |
| [~] | MKT-001 | P2 | Remover campanhas e métricas simuladas | BASE-011 | Auditoria identificou dados hardcoded no menu legado; a nova UI só expõe contratos reais ou estado indisponível |
| [~] | MKT-002 | P2 | Projetar afiliados multitenant | TEN-006 | Auditoria identificou modelo legado sem tenant; migrar vínculo, atribuição, comissão e repasse com auditoria antes de nova UI operacional |
| [ ] | MKT-003 | P2 | Projetar avaliações e moderação | CRM-001 | Autoria e status verificáveis |

## Fase 9.1 — Benefícios, fidelidade e afiliados

| Status | ID | Prioridade | Tarefa | Dependência | Critério de aceite |
|---|---|---:|---|---|---|
| [~] | BEN-001 | P0 | Consolidar domínio e navegação de Benefícios | TEN-006, MKT-001 | Marketing, Benefícios/Cupons, Fidelidade, Clientes/VIP e Afiliados têm fronteiras, permissões, estados e regras documentados |
| [~] | BEN-002 | P0 | Criar cupons e benefícios tenant-scoped | BEN-001 | Fundação de benefício de frete iniciada: regras tenant-scoped, prioridade/vigência e aplicação server-side; cupom persistido, regras globais e UI administrativa continuam pendentes |
| [ ] | BEN-003 | P0 | Criar ledger e regras de Hub Coins | BEN-001, CRM-003 | Créditos, débitos, resgates, expiração e recompensas idempotentes/auditáveis por tenant |
| [ ] | BEN-004 | P1 | Calcular elegibilidade e benefícios VIP | BEN-002, CRM-007 | Critérios e benefícios por base são calculados no servidor e não alteram snapshots históricos |
| [ ] | BEN-005 | P0 | Aplicar benefícios no carrinho e checkout | BEN-002, BEN-003, BEN-004, UI-027 | Cupom antes de VIP, bases separadas, endereço obrigatório para frete e snapshot imutável |
| [ ] | BEN-006 | P1 | Criar Loja de Cupons e resgate seguro | BEN-003, BEN-002 | Resgate debita Hub Coins e emite/reserva benefício em uma única transação |
| [ ] | BEN-007 | P1 | Migrar afiliados para regras e comissões auditáveis | MKT-002, PAY-008 | Atribuição confiável, comissão por pedido pago e reversão idempotente |
| [~] | APP-001 | P1 | Transformar Centro de Apps em catálogo operacional | UI-028, TEN-009 | Catálogo expõe instalação, ambiente e conexão OAuth do Melhor Envio; faltam adapters homologados para os gateways, Stripe Connect dedicado e validação visual/CI |

## Fase 10.1 — Estrutura do frontend administrativo

| Status | ID | Prioridade | Tarefa | Dependência | Critério de aceite |
|---|---|---:|---|---|---|
| [~] | ADM-ARC-001 | P1 | Normalizar domínios, nomes e entry points do Admin | GOV-008, UI-001 | Implementação concluída na branch; cada domínio possui uma única pasta inglesa, sem cópias monolíticas ou imports para caminhos legados. Aguardando build, Tests, E2E e Security verdes |
| [ ] | ADM-ARC-002 | P1 | Fracionar Marketing em subdomínios verificáveis | ADM-ARC-001, MKT-001, BEN-001 | Campanhas, cupons, fidelidade e métricas só recebem UI após contratos tenant-scoped; mocks removidos |

## Fase 10 — UI do painel e design system

| Status | ID | Prioridade | Tarefa | Dependência | Critério de aceite |
|---|---|---:|---|---|---|
| [~] | UI-001 | P1 | Aprovar tokens e componentes canônicos | GOV-006 | Catálogo documentado |
| [~] | UI-002 | P1 | Garantir Tailwind v4 corretamente importado | BASE-005 | Utilities presentes no build |
| [~] | UI-003 | P1 | Padronizar Lucide como ícones | UI-001 | Sem bibliotecas ou SVGs duplicados |
| [~] | UI-004 | P1 | Remover estilos inline e magic values gradualmente | UI-001 | Novos módulos usam tokens |
| [~] | UI-005 | P1 | Criar primitives acessíveis | UI-001 | Botões, ícones, tooltip, skeleton e filtros padronizados; testes incrementais pendentes |
| [~] | UI-006 | P1 | Criar patterns do painel | UI-005 | Header, SectionTabs, filtros, métricas e estados aplicados progressivamente |
| [x] | UI-007 | P1 | Dividir AdminPerfilCRM | UI-005, CRM-002 | Perfil 360º modularizado; contratos preservados e checks verdes no PR #23 |
| [x] | UI-008 | P1 | Dividir AdminOrders | UI-005, ORD-004 | Fluxos separados, contratos preservados e checks verdes; pendências de domínio continuam abertas |
| [x] | UI-009 | P1 | Dividir AdminCustomers | UI-005, CRM-002 | Lista, painel, benefícios e perfil modularizados; checks verdes no PR #23 |
| [~] | UI-010 | P2 | Dividir Marketing e Afiliados | UI-006, BEN-001 | As superfícies hardcoded foram removidas da navegação em favor de estados operacionais honestos; falta publicar os contratos reais de campanhas, audiência e afiliados antes de habilitar ações ou métricas |
| [~] | UI-011 | P1 | Padronizar loading/empty/error/success | UI-005 | Todos os módulos críticos cobertos |
| [ ] | UI-012 | P1 | Auditar WCAG 2.2 AA e teclado | UI-006 | Checklist e testes aprovados |
| [~] | UI-013 | P1 | Corrigir responsividade e zoom 200% | UI-006 | Sem scroll horizontal global |
| [ ] | UI-014 | P2 | Criar documentação visual dos componentes | UI-005 | Estados e uso demonstrados |
| [!] | UI-015 | P1 | Criar centro de notificações tenant-scoped | BASE-011, TEN-010 | Contrato real de leitura, não lidas e destinos autorizado; sem sino ou contador simulado |
| [x] | UI-016 | P1 | Aplicar padrão canônico ao módulo Pedidos | UI-005, UI-006, UI-008 | Lista, métricas, detalhe e diálogos usam primitives, dados reais e versões desktop/mobile; validação de CI pendente |
| [x] | UI-017 | P1 | Aplicar padrão canônico ao módulo Clientes/CRM | UI-005, UI-006, UI-007, UI-009 | Painel, diretório, perfil, VIP e configurações usam primitives, contratos reais e experiências desktop/mobile; validação de CI pendente |
| [x] | UI-018 | P1 | Aplicar padrão canônico ao módulo Pixel | UI-005, UI-006, UI-007, UI-009 | Painel, integrações, acionadores e diálogos usam primitives, contratos reais e experiências desktop/mobile; checks aprovados e PR #39 integrada |
| [x] | UI-019 | P1 | Padronizar interações globais do painel | UI-005, UI-006, UI-013 | Refresh único no shell, tooltip sem clipping, período canônico, textos longos legíveis e sidebar recolhida consistente; PR #41 integrada com Tests, E2E Tests e Security Scans verdes |
| [~] | UI-020 | P1 | Padronizar interações operacionais de dados | UI-005, UI-006, UI-013 | PR #42 integrada; revisão visual encontrou caixas de tooltip indevidas. Pendências separadas nos blocos UI-021 a UI-026; não considerar homologação visual concluída |
| [~] | UI-021 | P1 | Corrigir interações globais e temas | UI-020 | Bloco implementado: tooltips visuais/remanescentes removidos, busca com debounce de 350 ms sem contorno, diálogos de Pedidos/métricas com scroll lock, saída e backdrop seguro, métricas refinadas, rota com motion por token e modo claro azul-marinho nos shells desktop/mobile. Teste direcionado, build, Tests, E2E Tests e Security Scans verdes na PR #43; revisão visual em navegador ainda pendente |
| [x] | UI-022 | P1 | Completar reembolso com cancelamento e anexos | UI-021 | Integrado na PR #45 (`1cc6a81`): solicitação repetida oculta; cancelamento restaura origem auditada sob lock; motivo, modalidade e 1–2 imagens JPEG/PNG obrigatórios; higienização e storage privado; prévia/download por URL temporária assinada. Tests, E2E Tests e Security Scans verdes. Cashback continua dependente de idempotência/ledger em PAY-009 e CRM-003; estoque físico segue CAT-009 |
| [x] | UI-023 | P1 | Detalhar personalizações e cliente do pedido | UI-021 | Integrado na PR #46 (`4a38a7b`): tag Personalizado e textos agrupados por item/SKU/variante; perfil usa somente campos já autorizados do CRM. Mídia só renderiza prévia/download por URL temporária tenant-scoped; imagens legadas aguardam CAT-004 |
| [x] | UI-024 | P1 | Exibir documentos reais de cada operação | UI-022, UI-023 | Integrado na PR #47 (`b8b81db`): catálogo unificado com prévia/download autorizado; novos comprovantes de pagamento/entrega em storage privado tenant-scoped. Arquivos públicos legados são identificados sem URL até migração; declaração é operacional, XML/DANFE continuam UI-025 |
| [~] | UI-025 | P1 | Preparar emissão fiscal e declaração | UI-024 | Entregues: Centro de Apps, configuração fiscal por tenant, A1/credenciais protegidos, diagnóstico do catálogo ativo e declaração segura. Emissão, XML/protocolo/DANFE só com adapter homologado; espelho provisório nunca é NF-e |
| [!] | FIS-001 | P1 | Homologar adapter de emissão de NF-e | UI-025 | Provedor contratado, credenciais autorizadas, sandbox/homologação, assinatura, idempotência, webhook, XML/DANFE privados e autorização confirmada |
| [x] | UI-026 | P1 | Detalhar valores e progresso operacional | UI-021 | Integrado na PR #54 (`66b58e8`): checkout claro e responsivo com CEP editável, cotações opacas, resumo financeiro relido no servidor, conta por loja e endereço padrão salvo/selecionável. Tests, E2E Tests e Security Scans verdes. Pagamento, cupons, payment_attempt, pedido atômico e tela de conclusão continuam dependentes de adapter homologado, idempotência e webhook |
| [x] | UI-027 | P1 | Tornar frete e total do carrinho verificáveis | UI-026 | Integrado na PR #55 (`ea6ab85`): carrinho usa CEP editável, cotações opacas e resumo financeiro reconstruído pelo servidor; o rascunho é revalidado no checkout. Tests, E2E Tests e Security Scans verdes |
| [~] | UI-028 | P1 | Reorganizar navegação, submenus e espaçamento operacional | UI-006, BEN-001 | Navegação já separa Clientes, Benefícios & VIP, Marketing e Afiliados; Configurações agora usa título por aba, estados estáveis, tokens e composição de domínio desktop/mobile. Transportadoras foi separada em parceiros próprios, embalagens e auditoria; OAuth e remetente do Melhor Envio foram centralizados em Configurações → Logística na PR #85, integrada com Tests, E2E Tests e Security Scans verdes. Categorias foi modernizada na branch `ui/categories-modernization` com lista, editor, estados e composição mobile sem criar hierarquia ou filtros sem contrato; aguarda validação na PR. Faltam validar visualmente desktop/mobile, claro/escuro e teclado, além de consolidar a densidade dos demais menus |
| [ ] | UI-029 | P1 | Consolidar tokens de densidade e tema nos menus | UI-028, UI-001 | Espaçamentos internos, superfícies, estados de interação e padrões mobile documentados e aplicados sem valores arbitrários |

## Fase 11 — Storefront, SEO e desempenho

| Status | ID | Prioridade | Tarefa | Dependência | Critério de aceite |
|---|---|---:|---|---|---|
| [ ] | STO-001 | P1 | Separar bundle Storefront/Admin | BASE-005 | Rotas geram chunks separados |
| [ ] | STO-002 | P1 | Tornar tema configurável por tenant | TEN-009, UI-001 | Tokens de marca sem alterar componentes |
| [ ] | STO-003 | P1 | Remover produtos, banners e imagens hardcoded | CAT-002 | Loja usa dados reais |
| [ ] | STO-004 | P1 | Corrigir domínio canonical e metadados | TEN-003 | SEO usa domínio da loja |
| [ ] | STO-005 | P1 | Implementar páginas 404/erro | BASE-011 | Falha não exibe fallback enganoso |
| [ ] | STO-006 | P1 | Otimizar imagens, fontes e lazy loading | STO-001 | Core Web Vitals medidos |
| [ ] | STO-007 | P2 | Implementar cache público tenant-aware | TEN-010 | Invalidação por tenant |
| [ ] | STO-008 | P1 | Auditar checkout mobile e acessibilidade | ORD-001, UI-012 | Fluxo completo por teclado/mobile |
| [ ] | STO-009 | P2 | Preparar internacionalização configurável | CRM-002 | Locale/moeda por tenant |

## Auditoria da baseline — 2026-09-03

Os estados abaixo foram corrigidos para refletir evidência verificável. Itens de qualidade fora do escopo da baseline seguem pendentes ou bloqueados; não impedem o encerramento de BASE-012 a BASE-014 quando os checks deste PR estiverem verdes.

## Fase 12 — Testes e CI

| Status | ID | Prioridade | Tarefa | Dependência | Critério de aceite |
|---|---|---:|---|---|---|
| [~] | QA-001 | P0 | Escrever testes de Feature base (saúde, endpoints cruciais) | BASE-012 | Saúde coberta; faltam endpoints cruciais e execução verde |
| [~] | QA-002 | P0 | Configurar PHPStan nível máximo compatível no pipeline | BASE-012 | Larastan nível 5 configurado; elevar/validar nível compatível e pipeline verde |
| [ ] | QA-003 | P1 | Validar arquitetura no CI: Models não falam com Views | BASE-012 | Falta regra de arquitetura explícita no CI |
| [~] | QA-004 | P1 | Garantir formatação via Laravel Pint automatizado | BASE-012 | Pint configurado, mas há dívida de formatação e falta execução verde |
| [~] | QA-005 | P0 | Testes de Policies: Bloquear vazamento entre roles (RBAC) | BASE-012 | Há teste de autorização; falta matriz de Policies e execução verde |
| [x] | QA-006 | P0 | Testes de Tenancy: Garantir que Tenant A não lê dados de Tenant B | BASE-012 | Confirmado com `TenantIsolationTest.php`. |
| [ ] | QA-007 | P0 | Testes de Webhooks: Pagamentos falsos ou re-enviados (Idempotência) | BASE-012 | Pendente da integração de gateway; teste está explicitamente ignorado |
| [~] | QA-008 | P1 | Configurar ESLint + Prettier falhando build frontend em erro | BASE-012 | ESLint configurado; Prettier e execução verde pendentes |
| [~] | QA-009 | P0 | Teste E2E (Cypress/Playwright) do Checkout (Caminho Feliz) | BASE-012 | Servidor CI estabilizado; falta cenário feliz de checkout e execução verde |
| [ ] | QA-010 | P1 | Teste de unidade para Store de Carrinho (Pinia/Zustand) | BASE-012 | Não há store de carrinho coberta |
| [!] | QA-011 | P0 | "Branch Protection" ativo no GitHub proibindo merge sem testes passando | BASE-012 | Não há evidência verificável da configuração externa do GitHub |

## Fase 13 — Infraestrutura e produção

| Status | ID | Prioridade | Tarefa | Dependência | Critério de aceite |
|---|---|---:|---|---|---|
| [ ] | OPS-001 | P0 | Documentar ambientes local/staging/produção | BASE-014 | Variáveis e serviços definidos |
| [ ] | OPS-002 | P0 | Preparar servidor com DocumentRoot public | OPS-001 | Raiz/vendor/.env inacessíveis |
| [~] | OPS-003 | P0 | Configurar HTTPS e cookies seguros | SEC-015, OPS-002 | Proxy HTTPS confiável reconhecido no Docker local; produção, cookies Secure e teste externo permanecem pendentes |
| [ ] | OPS-004 | P1 | Configurar workers e scheduler | OPS-001 | Supervisor/systemd e cron ativos |
| [ ] | OPS-005 | P1 | Configurar Redis/cache sem fallback inseguro | TEN-010 | Cache distribuído saudável |
| [ ] | OPS-006 | P0 | Configurar backups e teste de restauração | OPS-001 | Restore ensaiado |
| [ ] | OPS-007 | P1 | Criar logs estruturados e correlação | SEC-014 | request/tenant IDs disponíveis |
| [ ] | OPS-008 | P1 | Adicionar métricas, health checks e alertas | OPS-004 | Incidentes detectáveis |
| [ ] | OPS-009 | P1 | Criar pipeline staging → produção | QA-011 | Deploy reproduzível e aprovável |
| [ ] | OPS-010 | P1 | Criar rollback de código e banco | OPS-009 | Procedimento testado |
| [ ] | OPS-011 | P2 | Definir CDN e storage S3 privado | TEN-011 | Assets e documentos separados |
| [ ] | OPS-012 | P1 | Executar hardening de produção | OPS-003 | Checklist de segurança aprovado |

## Fase 14 — Homologação e lançamento

| Status | ID | Prioridade | Tarefa | Dependência | Critério de aceite |

Atualizado em: 2026-09-08 — OAuth Mercado Pago/PagBank passou a usar URLs oficiais, PKCE e credenciais cifradas por instalação; Stripe Connect e billing seguem em implementação.
| Status | ID | Prioridade | Tarefa | Dependência | Critério de aceite |

## Fase 15 — Cofre, Conexões OAuth e Billing da Plataforma

| Status | ID | Prioridade | Tarefa | Dependência | Critério de aceite |
|---|---|---:|---|---|---|
| [x] | VAULT-001 | P0 | Separar cofre local, staging e produção | OPS-001 | Guia de ambientes e cofre registrado; local usa `APP_KEY` fora do Git e produção exige Secret Manager/variáveis protegidas |
| [~] | VAULT-002 | P0 | Criar Super Admin → Cofre e diagnóstico | VAULT-001 | API/tela agora exibem prontidão não secreta por provedor/ambiente e instrução de `.env` local vs. Secret Manager; faltam validação automatizada, rotação integrada e checks verdes |
| [ ] | APP-010 | P0 | Stripe Connect Onboarding por lojista | PAY-004, VAULT-001 | Conta conectada, webhook central e ambiente isolado; sem chaves manuais |
| [~] | APP-011 | P0 | Mercado Pago OAuth por lojista | VAULT-001 | URL oficial com state/PKCE S256, callback, troca server-side e token cifrado entregues; faltam refresh, webhook HMAC, checkout e Sandbox real |
| [~] | APP-012 | P0 | PagBank Connect OAuth por lojista | VAULT-001 | URL Connect oficial, callback e token cifrado entregues; faltam renovação, notificações autenticadas, checkout e Sandbox real |
| [ ] | APP-013 | P0 | Pagar.me por chaves de API do lojista | VAULT-001 | Chaves teste/live criptografadas, tokenização e webhook confirmado |
| [~] | APP-015 | P0 | Melhor Envio OAuth por lojista | VAULT-001, SHIP-004 | Authorization Code, state único, callback fixo, token cifrado e renovação horária antes do vencimento entregues; faltam validação de webhook, Sandbox real e homologação de etiquetas |
| [~] | APP-014 | P0 | Registry de webhooks centralizados | APP-010, APP-011, APP-012, APP-013 | Instalação opaca, URL central, state de uso único e armazenamento cifrado por instalação criados; Melhor Envio agora usa o mesmo registry OAuth; faltam handlers assinados, fila, dedupe e reconciliação por provedor |
| [ ] | BILL-001 | P0 | Modelar planos, assinaturas, faturas e estados de cobrança | VAULT-001 | Ledger/auditoria e tenant billing state separados de pagamentos da loja |
| [ ] | BILL-002 | P0 | Cobrança automática da plataforma | BILL-001 | Webhooks dirigem ativação, falha, cancelamento, pausa e reativação; cron só reconcilia |
| [ ] | BILL-003 | P0 | Cobrança manual, PIX, boleto, estorno e cancelamento | BILL-001 | Valores server-side, comprovantes e transições auditáveis; sem baixa manual silenciosa |
| [ ] | BILL-004 | P0 | Bloqueio gradual e reativação de loja | BILL-002, BILL-003 | Tolerância, restrição, suspensão e reativação só por estado financeiro confirmado |
| [ ] | UI-030 | P1 | Guias do Super Admin para cofre e billing | VAULT-002, BILL-001 | Livro de ajuda filtrável, dicionário, estados e passos de diagnóstico |
| [~] | UI-031 | P1 | Guias da Central de Apps para lojista | APP-010 | Livro com busca/filtro e capítulos de gateway integrado; faltam links oficiais e validação visual/CI |
| [x] | UI-032 | P1 | Modernizar login administrativo | SEC-003, SEC-005, SEC-006, UI-001 | Tela pt-BR com tokens, dark, desktop/mobile dedicados, MFA já suportado pelo contrato e sessão temporária; PR #81 integrada com Tests, E2E Tests e Security Scans verdes |
