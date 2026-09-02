# HUB Commerce — Task Board

Atualizado em: 2026-09-02  
Documento vivo: atualizar o status neste arquivo no mesmo commit da implementação.

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
| [ ] | SEC-002 | P0 | Rotacionar tokens de tracking potencialmente expostos | SEC-001 | Runbook pronto; revogação externa ainda obrigatória |
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
| [ ] | BASE-002 | P0 | Definir estratégia segura para bancos já existentes | BASE-001 | Migration de correção e rollback testados |
| [x] | BASE-003 | P0 | Unificar Product/Produto | BASE-001 | Model e imports únicos |
| [ ] | BASE-004 | P0 | Unificar Category/Categoria | BASE-001 | Tabela, model e API consistentes |
| [ ] | BASE-005 | P0 | Corrigir cinco imports React inexistentes | GOV-006 | npm run build funciona |
| [ ] | BASE-006 | P0 | Corrigir rota /api/customers ou removê-la | BASE-003 | Nenhuma action inexistente |
| [ ] | BASE-007 | P0 | Trocar busca pública para endpoint storefront | BASE-003 | Visitante pesquisa sem token admin |
| [ ] | BASE-008 | P1 | Normalizar campos de preço, estoque e status | BASE-003 | Contrato único backend/frontend |
| [ ] | BASE-009 | P1 | Criar enums e transições de status de pedido | BASE-008 | Sem mistura pending/paid e estados antigos |
| [ ] | BASE-010 | P1 | Remover scripts manuais de schema da raiz | BASE-002 | Alterações somente por migrations |
| [ ] | BASE-011 | P1 | Padronizar respostas e códigos HTTP da API | SEC-011 | Contrato de erro documentado |
| [ ] | BASE-012 | P1 | Adicionar paginação e limites às listagens | BASE-011 | Listagens possuem limite máximo |
| [ ] | BASE-013 | P2 | Eliminar N+1 e queries redundantes | BASE-012 | Queries críticas medidas |
| [ ] | BASE-014 | P1 | Fazer PHP e frontend iniciarem por comandos documentados | BASE-005 | Setup reproduzível em máquina limpa |

## Fase 3 — Fundação multitenant

| Status | ID | Prioridade | Tarefa | Dependência | Critério de aceite |
|---|---|---:|---|---|---|
| [x] | TEN-001 | P0 | Aprovar ADR da estratégia shared-schema | GOV-008 | Decisão e trade-offs aprovados |
| [ ] | TEN-002 | P0 | Criar tenants | TEN-001 | Tenant possui UUID, status e configurações básicas |
| [ ] | TEN-003 | P0 | Criar tenant_domains | TEN-002 | Domínio único e verificável |
| [ ] | TEN-004 | P0 | Implementar TenantContext imutável | TEN-002 | Contexto disponível em request e jobs |
| [ ] | TEN-005 | P0 | Resolver tenant por domínio | TEN-003 | Domínio inválido falha com segurança |
| [ ] | TEN-006 | P0 | Adicionar tenant_id às entidades de negócio | TEN-004 | Backfill e constraints concluídos |
| [ ] | TEN-007 | P0 | Aplicar escopo tenant a queries e route binding | TEN-006 | IDs de outro tenant não são encontrados |
| [ ] | TEN-008 | P0 | Criar índices e unicidades compostas | TEN-006 | E-mail, SKU, slug e cupom isolados |
| [ ] | TEN-009 | P0 | Isolar configurações globais por tenant | TEN-006 | Sem registros fixos id=1 globais |
| [ ] | TEN-010 | P0 | Isolar cache por tenant | TEN-004 | Keys prefixadas e testes negativos |
| [ ] | TEN-011 | P0 | Isolar arquivos por tenant | TEN-006 | Prefixo tenants/{uuid} aplicado |
| [ ] | TEN-012 | P0 | Propagar tenant em filas e eventos | TEN-004 | Job rejeita contexto ausente/inválido |
| [ ] | TEN-013 | P1 | Isolar métricas e tracking | TEN-006 | Dashboard nunca mistura lojas |
| [ ] | TEN-014 | P1 | Criar onboarding de nova loja | TEN-009 | Tenant nasce com defaults válidos |
| [ ] | TEN-015 | P1 | Implementar suspensão e lifecycle do tenant | TEN-005 | Tenant suspenso não opera |
| [ ] | TEN-016 | P1 | Criar suíte automatizada de isolamento | TEN-007 | Testes cruzados em toda API crítica |

## Fase 4 — Identidade, equipes e permissões

| Status | ID | Prioridade | Tarefa | Dependência | Critério de aceite |
|---|---|---:|---|---|---|
| [ ] | IAM-001 | P0 | Separar usuário global e membership no tenant | TEN-002 | Usuário participa de múltiplas lojas |
| [ ] | IAM-002 | P0 | Definir matriz de roles e permissions | IAM-001 | Matriz documentada e testada |
| [ ] | IAM-003 | P0 | Aplicar Policies por recurso | IAM-002 | Permissões verificadas no backend |
| [ ] | IAM-004 | P1 | Implementar convite de equipe | IAM-002 | Convite expira e é de uso único |
| [ ] | IAM-005 | P1 | Implementar recuperação de senha segura | SEC-005 | Tokens hash/TTL/uso único |
| [ ] | IAM-006 | P1 | Implementar verificação de e-mail segura | IAM-001 | Link assinado e idempotente |
| [ ] | IAM-007 | P1 | Implementar MFA para administradores | IAM-003 | MFA habilitável e recuperável |
| [ ] | IAM-008 | P1 | Criar trilha de auditoria administrativa | IAM-003 | Ator, tenant, ação e alvo registrados |
| [ ] | IAM-009 | P2 | Criar sessões/dispositivos e revogação | SEC-006 | Usuário encerra sessões remotas |

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

## Fase 6 — Clientes, CRM e LGPD

| Status | ID | Prioridade | Tarefa | Dependência | Critério de aceite |
|---|---|---:|---|---|---|
| [ ] | CRM-001 | P1 | Isolar cadastro de cliente por tenant | TEN-008 | Mesmo e-mail permitido em lojas distintas |
| [ ] | CRM-002 | P1 | Normalizar perfil e endereços | CRM-001 | Dados reais substituem mocks |
| [ ] | CRM-003 | P1 | Corrigir carteira, coins e cashback | BASE-009 | Ledger transacional e auditável |
| [ ] | CRM-004 | P1 | Proteger alterações de CPF/e-mail/telefone | SEC-009, IAM-003 | Reautorização e comprovante privado |
| [ ] | CRM-005 | P1 | Criar consentimentos e preferências | SEC-016 | Consentimento versionado |
| [ ] | CRM-006 | P1 | Implementar exportação e exclusão LGPD | SEC-016 | Solicitação rastreável e segura |
| [ ] | CRM-007 | P2 | Consolidar VIP e segmentação | CRM-001 | Regras isoladas por tenant |
| [ ] | CRM-008 | P2 | Remover dados pessoais fictícios do frontend | CRM-002 | Nenhuma persona hardcoded em produção |

## Fase 7 — Carrinho, pedidos e pagamentos

| Status | ID | Prioridade | Tarefa | Dependência | Critério de aceite |
|---|---|---:|---|---|---|
| [ ] | ORD-001 | P1 | Conectar checkout ao carrinho real | BASE-005, CAT-002 | Itens vêm do estado real |
| [ ] | ORD-002 | P1 | Recalcular preços e promoções no servidor | CAT-002 | Cliente não controla total |
| [ ] | ORD-003 | P1 | Reservar estoque com concorrência segura | CAT-003 | Sem overselling |
| [ ] | ORD-004 | P1 | Criar máquina de estados do pedido | BASE-009 | Transições inválidas bloqueadas |
| [ ] | PAY-001 | P0 | Criar PaymentGateway interface | SEC-007 | Contrato comum testado |
| [ ] | PAY-002 | P0 | Criar payment_attempts por tenant | PAY-001, TEN-006 | Tentativas persistidas sem secrets |
| [ ] | PAY-003 | P0 | Implementar idempotência de checkout | PAY-002 | Repetição não duplica cobrança |
| [ ] | PAY-004 | P1 | Integrar Stripe com tokenização oficial | SEC-008, PAY-003 | Sandbox aprovado |
| [ ] | PAY-005 | P1 | Integrar Mercado Pago com tokenização oficial | SEC-008, PAY-003 | Sandbox aprovado |
| [ ] | PAY-006 | P1 | Integrar Pagar.me com tokenização oficial | SEC-008, PAY-003 | Sandbox aprovado |
| [ ] | PAY-007 | P0 | Implementar webhooks assinados e idempotentes | PAY-002 | Replay e assinatura testados |
| [ ] | PAY-008 | P1 | Sincronizar estados payment/order | PAY-007, ORD-004 | Webhook é fonte autoritativa |
| [ ] | PAY-009 | P1 | Implementar refund seguro | PAY-008, IAM-003 | Permissão, idempotência e auditoria |
| [ ] | PAY-010 | P1 | Criar reconciliação financeira | PAY-008 | Divergências identificadas |
| [ ] | PAY-011 | P1 | Separar credenciais test/live por tenant | SEC-012, TEN-009 | Produção rejeita chave de teste |
| [ ] | PAY-012 | P1 | Revisar conformidade PCI e LGPD | PAY-004, PAY-005, PAY-006 | Nenhum dado bruto de cartão no HUB |

## Fase 8 — Frete e logística

| Status | ID | Prioridade | Tarefa | Dependência | Critério de aceite |
|---|---|---:|---|---|---|
| [ ] | SHIP-001 | P1 | Isolar remetente e Melhor Envio por tenant | TEN-009 | Token/endereço por loja |
| [ ] | SHIP-002 | P1 | Mover sandbox/produção para configuração | SHIP-001 | Sem booleano hardcoded |
| [ ] | SHIP-003 | P1 | Validar cotação e dimensões | CAT-002 | Limites e erros normalizados |
| [ ] | SHIP-004 | P1 | Criar adapter do Melhor Envio | SHIP-002 | HTTP resiliente e testável |
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
| [ ] | MKT-001 | P2 | Remover campanhas e métricas simuladas | BASE-011 | Dados reais ou recurso desativado |
| [ ] | MKT-002 | P2 | Projetar afiliados multitenant | TEN-006 | Regras e comissões auditáveis |
| [ ] | MKT-003 | P2 | Projetar avaliações e moderação | CRM-001 | Autoria e status verificáveis |

## Fase 10 — UI do painel e design system

| Status | ID | Prioridade | Tarefa | Dependência | Critério de aceite |
|---|---|---:|---|---|---|
| [ ] | UI-001 | P1 | Aprovar tokens e componentes canônicos | GOV-006 | Catálogo documentado |
| [ ] | UI-002 | P1 | Garantir Tailwind v4 corretamente importado | BASE-005 | Utilities presentes no build |
| [ ] | UI-003 | P1 | Padronizar Lucide como ícones | UI-001 | Sem bibliotecas ou SVGs duplicados |
| [ ] | UI-004 | P1 | Remover estilos inline e magic values gradualmente | UI-001 | Novos módulos usam tokens |
| [ ] | UI-005 | P1 | Criar primitives acessíveis | UI-001 | Button/Input/Modal/Table testados |
| [ ] | UI-006 | P1 | Criar patterns do painel | UI-005 | Header, filtros, estados e ações consistentes |
| [ ] | UI-007 | P1 | Dividir AdminPerfilCRM | UI-005, CRM-002 | Componentes menores e testados |
| [ ] | UI-008 | P1 | Dividir AdminOrders | UI-005, ORD-004 | Fluxos por feature |
| [ ] | UI-009 | P1 | Dividir AdminCustomers | UI-005, CRM-002 | Lista e perfil desacoplados |
| [ ] | UI-010 | P2 | Dividir Marketing e Afiliados | UI-006 | Sem componentes monolíticos |
| [ ] | UI-011 | P1 | Padronizar loading/empty/error/success | UI-005 | Todos os módulos críticos cobertos |
| [ ] | UI-012 | P1 | Auditar WCAG 2.2 AA e teclado | UI-006 | Checklist e testes aprovados |
| [ ] | UI-013 | P1 | Corrigir responsividade e zoom 200% | UI-006 | Sem scroll horizontal global |
| [ ] | UI-014 | P2 | Criar documentação visual dos componentes | UI-005 | Estados e uso demonstrados |

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

## Fase 12 — Testes e CI

| Status | ID | Prioridade | Tarefa | Dependência | Critério de aceite |
|---|---|---:|---|---|---|
| [ ] | QA-001 | P0 | Substituir testes de exemplo por baseline real | BASE-001 | Casos críticos cobertos |
| [ ] | QA-002 | P0 | Adicionar npm ci e build à CI | BASE-005 | Build bloqueia merge |
| [ ] | QA-003 | P1 | Adicionar Pint e análise estática PHP | BASE-011 | Gate obrigatório |
| [ ] | QA-004 | P1 | Adicionar ESLint e testes React | BASE-005 | Gate obrigatório |
| [ ] | QA-005 | P0 | Adicionar testes de autorização | SEC-004 | Matriz negativa coberta |
| [ ] | QA-006 | P0 | Adicionar testes de isolamento tenant | TEN-016 | Acesso cruzado bloqueia merge |
| [ ] | QA-007 | P0 | Adicionar testes de pagamento/webhook | PAY-007 | Idempotência e assinatura cobertas |
| [ ] | QA-008 | P1 | Adicionar dependency e secret scanning | SEC-012 | Alertas bloqueiam risco crítico |
| [ ] | QA-009 | P1 | Adicionar E2E de fluxos principais | STO-008 | Loja e admin validados |
| [ ] | QA-010 | P1 | Definir cobertura mínima progressiva | QA-001 | Meta documentada e medida |
| [ ] | QA-011 | P1 | Proteger main com CI e revisão | QA-002 | Merge sem gates impedido |

## Fase 13 — Infraestrutura e produção

| Status | ID | Prioridade | Tarefa | Dependência | Critério de aceite |
|---|---|---:|---|---|---|
| [ ] | OPS-001 | P0 | Documentar ambientes local/staging/produção | BASE-014 | Variáveis e serviços definidos |
| [ ] | OPS-002 | P0 | Preparar servidor com DocumentRoot public | OPS-001 | Raiz/vendor/.env inacessíveis |
| [ ] | OPS-003 | P0 | Configurar HTTPS e cookies seguros | SEC-015, OPS-002 | Teste externo aprovado |
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
|---|---|---:|---|---|---|
| [ ] | REL-001 | P0 | Executar auditoria dinâmica de segurança | OPS-012 | Achados P0/P1 resolvidos |
| [ ] | REL-002 | P0 | Executar teste multitenant ponta a ponta | TEN-016, QA-009 | Nenhum vazamento cruzado |
| [ ] | REL-003 | P0 | Homologar gateways reais | PAY-012 | Compra/refund/conciliação aprovados |
| [ ] | REL-004 | P1 | Homologar logística | SHIP-005 | Cotação/etiqueta/rastreio aprovados |
| [ ] | REL-005 | P1 | Homologar LGPD e retenção | CRM-006 | Processos exercitados |
| [ ] | REL-006 | P1 | Executar teste de carga | OPS-008 | SLOs atendidos |
| [ ] | REL-007 | P1 | Treinar operação e suporte | OPS-009 | Runbooks disponíveis |
| [ ] | REL-008 | P0 | Realizar go-live controlado | REL-001 a REL-007 | Feature flags, monitoramento e rollback ativos |
| [ ] | REL-009 | P1 | Fazer revisão pós-lançamento | REL-008 | Incidentes e melhorias registrados |

## Próximo bloco recomendado

SEC-001 → SEC-003 → SEC-004 → SEC-005 → SEC-007 → SEC-008 → SEC-009 → SEC-010.

Não iniciar gateways reais, redesign amplo ou migrations multitenant antes de concluir a contenção P0 e obter baseline verde.
