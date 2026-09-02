# Multitenancy

Estratégia inicial aprovada: banco compartilhado, schema compartilhado e coluna tenant_id nas entidades de negócio. Mudança de estratégia exige ADR.

## Resolução do tenant

- Resolver tenant por domínio validado antes de acessar dados de negócio.
- Header de tenant só é permitido para comunicação interna autenticada.
- Tenant suspenso ou domínio não verificado deve falhar de forma segura.
- O tenant atual deve ser objeto imutável no contexto da requisição.

## Isolamento

- Entidades tenant-owned exigem tenant_id não nulo, índice e relacionamento.
- Toda query, route binding, policy, cache, evento, job, arquivo e métrica deve carregar tenant_id.
- find/findOrFail global é proibido para entidades tenant-owned.
- Jobs restauram e validam o tenant antes de executar.
- Cache usa prefixo tenant:{id}: e nunca fallback global.
- Arquivos usam tenants/{uuid}/public ou tenants/{uuid}/private.
- Logs estruturados registram tenant_id sem gravar PII desnecessária.

## Banco

- Unicidades de e-mail de cliente, CPF, SKU, slug, cupom e chaves de configuração devem ser compostas com tenant_id quando a regra for por loja.
- Sempre que possível, foreign keys compostas devem impedir associação entre tenants.
- Tabelas centrais devem ser explicitamente marcadas como landlord; o padrão é tenant-owned.

## Acesso de usuários

- Usuário da plataforma e participação no tenant são conceitos separados.
- Usar membership com role/status por tenant.
- Superadmin é um fluxo separado, auditado e não deve depender de parâmetros controlados pelo cliente.
- Testes de isolamento negativos são obrigatórios para cada endpoint e job.
