# Perfis e permissões

## Planos de autorização

| Escopo | Quem administra | Exemplos de cargos | Limite |
|---|---|---|---|
| Plataforma | Superadmin ativo | superadmin, financeiro_da_plataforma, suporte | tenants, cobrança, suporte, auditoria e operações globais |
| Tenant | Owner ou membro com permissão delegável | owner, admin, financeiro, estoque, atendimento | somente a loja à qual o membership pertence |

Cargos de plataforma e de tenant são independentes. Ter um cargo interno da plataforma não concede acesso operacional a uma loja; atuar em uma loja exige contexto e auditoria. Um cargo de tenant nunca concede permissão de plataforma.

## Proteção do proprietário da loja

O primeiro administrador criado para uma loja é o `owner` protegido. Outro admin da mesma loja não pode removê-lo, desativá-lo, retirar seus cargos ou reduzir suas permissões. Apenas superadmin ativo pode transferir, suspender ou remover essa titularidade, sempre de forma auditada e sem deixar tenant operacional sem owner.

## Matriz inicial legada

| Ação | Público | Cliente | Admin ativo |
|---|---:|---:|---:|
| Consultar vitrine | Sim | Sim | Sim |
| Enviar evento de tracking validado | Sim, com throttle | Sim | Sim |
| Entrar no painel | Não | Não | Sim |
| Alterar catálogo, pedidos e configurações | Não | Não | Sim |
| Visualizar credenciais completas | Não | Não | Não |
| Substituir credenciais | Não | Não | Sim |
| Gerar link de documento sensível | Não | Não | Sim, com URL assinada de 5 minutos |
| Aprovar pagamento manualmente pelo checkout | Não | Não | Não |

## Invariantes

O login administrativo legado valida senha, role igual a admin e status igual a ATIVO. O token recebe apenas a ability admin, possui expiração e é revogado no logout.

A Fase 3 cria a fundação de tenants; a Fase 4 migra a autorização global para memberships, cargos e permissões específicas de plataforma e tenant, conforme ADR-0002. A autorização final é sempre verificada no backend; menus e submenus são apenas uma representação visual dessas permissões.
