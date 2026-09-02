# Perfis e permissões

## Matriz inicial

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

O login administrativo valida senha, role igual a admin e status igual a ATIVO. O token recebe apenas a ability admin, possui expiração e é revogado no logout.

Todas as rotas sob /api/admin usam auth:sanctum e o middleware admin. A Fase 3 substituirá a autorização global por membership e permissões específicas do tenant.
