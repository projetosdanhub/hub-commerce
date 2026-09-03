# Identidade, equipes e permissões

## Objetivo

O HUB Commerce usa uma identidade global (`users`) e separa explicitamente os
dois contextos administrativos:

| Contexto | Vínculo | Função |
|---|---|---|
| Plataforma | `platform_memberships` | Operar o SaaS, tenants, cobrança, suporte e auditoria. |
| Loja | `tenant_memberships` | Operar exclusivamente os recursos de uma loja. |
| Cliente | `users` sem membership administrativo | Acessar somente a própria conta e recursos autorizados. |

Um usuário pode participar de várias lojas e, separadamente, ter uma função na
plataforma. Um vínculo nunca é inferido por parâmetro enviado pelo navegador.

## Cargos protegidos

- **Superadmin:** autoridade máxima da plataforma. Pode administrar cargos da
  plataforma, operar tenants e transferir a propriedade de uma loja. O último
  superadmin ativo não pode ser rebaixado, suspenso ou revogado.
- **Owner da loja:** membership protegido que representa o responsável inicial
  da loja. Administradores da mesma loja não podem remover, suspender nem trocar
  seus cargos. A transferência só é feita pelo fluxo de plataforma com
  `platform.tenants.manage`.
- **Administrador da loja:** cargo de sistema para operações delegáveis da
  loja. Não substitui o owner e não inclui privilégios críticos não delegáveis.

## Delegação de permissões

As permissões usam chaves estáveis. A criação ou alteração de cargos exige que
o ator possua a permissão correspondente e não delegue um privilégio acima do
seu próprio nível.

| Escopo | Exemplos delegáveis | Reservado / não delegável |
|---|---|---|
| Plataforma | leitura/gestão de tenants, faturamento, equipe e auditoria | superadmin, gestão de cargos, suspensão de tenant e suporte por impersonação |
| Loja | catálogo, pedidos, CRM, frete, tracking, equipe e cargos | pagamentos, integrações e configurações críticas |

Somente quem tem `platform.roles.manage` cria cargos internos da plataforma;
por padrão, esse poder é do superadmin. Isso permite cargos como **Financeiro**
sem permitir que esse setor crie ou eleve privilégios próprios.

## Fluxos protegidos

1. Login valida senha, usuário ativo e membership. O token Sanctum recebe
   apenas as abilities aplicáveis (`tenant`, `platform` e compatibilidade
   temporária `admin`).
2. Rotas de loja exigem tenant resolvido, membership naquele tenant e
   `tenant.permission:*` no backend.
3. Rotas de plataforma exigem `platform.permission:*`, independente do host da
   loja.
4. Convites armazenam somente o hash do token, expiram, são revogados ao emitir
   um novo convite e só podem ser aceitos pela conta do mesmo e-mail. O link de
   e-mail usa fragmento (`#token=`), que a UI envia no corpo do POST para não
   vazar o segredo em logs HTTP.
5. MFA TOTP guarda segredo criptografado e códigos de recuperação com hash.
   Códigos de recuperação são exibidos uma única vez e respostas sensíveis usam
   `Cache-Control: no-store`.
6. Recuperação de senha usa o broker do Laravel, com token hashado, TTL, uso
   único e revogação das sessões existentes após a troca.
7. Ações de autorização relevantes geram `authorization_audit_logs` com ator,
   escopo, alvo, antes/depois redigidos, request ID e IP com HMAC.

## Operação inicial

Após criar uma conta ativa de operador, execute:

```bash
php artisan identity:grant-superadmin operador@exemplo.com --force
```

Em produção, `--force` é obrigatório. O comando não cria senha nem usuário; ele
somente promove uma conta existente e registra a ação. O operador deve habilitar
MFA no primeiro acesso.

## Integração do frontend

O frontend deve consultar as permissões entregues pelo backend para exibir
menus, mas nunca deve tratar isso como autorização. As chamadas de API são a
fonte de verdade. O painel visual dedicado de superadmin e as telas de equipe
consomem estas rotas em etapa posterior de UI.
