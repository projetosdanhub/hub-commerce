# Operação multitenant — Fase 3

## Resolução segura

A vitrine, tracking e rotas administrativas de uma loja resolvem o tenant exclusivamente pelo host HTTP correspondente a um registro em `tenant_domains` com `verified_at` preenchido. Não há fallback por header, query string ou ID informado pelo cliente.

Um domínio desconhecido responde 404. Um tenant suspenso responde 423 e não executa operações da loja.

## Desenvolvimento local

No arquivo hosts da máquina, associe domínios de teste ao servidor local, por exemplo:

```
127.0.0.1 loja-a.test
127.0.0.1 loja-b.test
```

Crie cada tenant e domínio por serviço administrativo de plataforma. O desafio de domínio é emitido por `TenantDomainVerificationService::issueChallenge()`; apenas o hash é salvo. A confirmação por `verify()` é de uso único.

## Dados e contexto

- Entidades tenant-owned possuem `tenant_id` obrigatório, FK e scope Eloquent.
- A base já existente é migrada para o tenant inicial criado pela migration.
- `users.email` continua global: uma pessoa reutiliza a mesma identidade em várias lojas. Perfis e permissões por loja serão concluídos na Fase 4.
- Cache usa `tenant:{uuid}:…`; arquivos usam `tenants/{uuid}/…`.
- Jobs de tracking carregam `tenantId` e recusam tenant ausente ou inativo.

## Lifecycle e rollback

O serviço `TenantLifecycleService` suspende/reativa uma loja. Suspensão não remove dados e bloqueia novas requisições resolvidas para o tenant.

As migrations seguem expand/migrate/contract: elas criam a infraestrutura, fazem backfill da loja única existente e adicionam constraints. Não reescreva migrations publicadas.
