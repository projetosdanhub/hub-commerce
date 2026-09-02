# ADR-0002: Multitenancy shared-schema e fronteiras de autoridade

- Status: Aceita
- Data: 2026-09-02
- Responsáveis: Responsável do HUB Commerce

## Contexto

O HUB Commerce evoluirá de uma aplicação de loja única para uma plataforma SaaS B2B multitenant. Cada loja precisa ter dados, domínio, configurações, equipe, catálogo, pedidos, integrações e permissões isolados.

Também há dois níveis de autoridade que não podem ser confundidos:

1. **Superadmin da plataforma**: dono do painel geral do HUB Commerce, com visão operacional de todos os tenants.
2. **Membro do tenant**: usuário que atua em uma ou mais lojas, inclusive o lojista proprietário, administradores e colaboradores de setores específicos.

O campo legado `users.role` representa uma autorização global de aplicação única e não suporta com segurança usuários em múltiplos tenants, cargos customizados ou permissões por menu.

## Problema

Sem uma separação explícita entre autoridade de plataforma, vínculo com a loja e cargo da loja, um usuário pode obter acesso cruzado entre tenants ou um lojista pode, por engano, receber poderes de plataforma.

A plataforma também precisa permitir que cada lojista crie cargos para seus setores e controle o acesso a menus e submenus sem permitir que ele invente rotas, permissões sensíveis ou privilégios acima da própria autorização.

## Decisão

### Estratégia de dados

A plataforma adotará **banco compartilhado e schema compartilhado**, com `tenant_id` obrigatório nas entidades tenant-owned.

Dados landlord, que pertencem à plataforma, incluem:

- `users`: identidade global;
- `tenants` e `tenant_domains`;
- a concessão auditável de acesso de plataforma ao superadmin;
- catálogo canônico de permissões de aplicação.

Dados de uma loja incluem, por padrão, catálogo, pedidos, clientes, configurações, integrações, tracking, arquivos, cache, equipes e cargos.

### Superadmin

Superadmin será uma autoridade **de plataforma**, separada das roles de tenant:

- não é concedido por header, parâmetro de rota ou payload controlado pelo cliente;
- não é editável por lojistas;
- usa guard/ability e trilha de auditoria próprios;
- pode acessar o painel geral e consultar tenants conforme permissões de plataforma;
- não recebe automaticamente acesso operacional a uma loja: qualquer atuação dentro de um tenant é explicitamente auditada e usa contexto de tenant.

A coluna legada `users.role` não será a fonte de autoridade do superadmin após a migração para Identity/Tenancy.

### Equipe, cargos e permissões do tenant

A autorização dentro de uma loja será modelada por:

- `tenant_memberships`: vínculo entre `user_id` e `tenant_id`, com status;
- `tenant_roles`: cargos próprios de cada loja;
- `permissions`: capacidades canônicas definidas pela plataforma, por exemplo `catalog.view`, `catalog.manage`, `orders.view` e `settings.manage`;
- `tenant_role_permissions`: associação entre cargo e capacidade;
- cargos de sistema como `owner` e `admin`, protegidos contra exclusão ou alteração indevida.

O proprietário da loja pode criar cargos e atribuí-los a membros do próprio tenant quando possuir as permissões de gestão de equipe e cargos. A delegação não pode conceder uma capacidade de plataforma nem uma capacidade que exceda a autorização delegável do ator.

Menus e submenus serão definidos pela aplicação; sua visibilidade será derivada das permissões concedidas no backend. Nenhum tenant poderá cadastrar rotas arbitrárias, chaves de permissão globais ou esconder a verificação de autorização apenas no frontend.

### Contexto e resolução

- A vitrine resolve o tenant pelo domínio verificado.
- O painel da loja opera com um tenant ativo que pertence ao usuário autenticado.
- O painel geral do superadmin usa domínio/rota de plataforma e não aceita seleção de tenant controlada pelo navegador como prova de autorização.
- Toda leitura e escrita tenant-owned recebe `TenantContext` imutável antes de consultar dados.
- Trocar de loja exige membership válido, tenant ativo e registro de auditoria quando aplicável.

## Alternativas consideradas

### Manter `users.role` como fonte de autorização

Rejeitada. Uma role global única não representa participação em múltiplas lojas e permite confundir um administrador de loja com autoridade da plataforma.

### Criar uma tabela de usuários por tenant

Rejeitada. Duplicaria identidade, complicaria login, recuperação de senha, convites e suporte a um usuário com acesso a mais de uma loja.

### Permitir cargos e menus livres por tenant

Rejeitada. Um tenant não pode criar endpoints, permissões globais ou regras de autorização. Cargos são customizáveis, mas usam um catálogo canônico de capacidades e menus definidos pela aplicação.

### Banco ou schema exclusivo por tenant

Adiada. Essa opção aumenta custo operacional, migrações e observabilidade antes de a plataforma validar seus limites de domínio. Uma mudança futura exige nova ADR e plano de migração.

## Consequências positivas

- Um usuário pode participar de várias lojas sem duplicar conta.
- Superadmin fica separado da administração do lojista.
- Cargos por setor suportam operação real sem expor privilégios de plataforma.
- Menus e submenus obedecem à mesma autorização server-side das APIs.
- A estrutura permite adicionar tenants e equipes gradualmente.

## Riscos e consequências negativas

- Shared-schema exige disciplina rigorosa de `tenant_id`, índices, scopes, cache, filas e testes negativos.
- A transição do legado precisará conviver temporariamente com `users.role`.
- Cargos customizados exigem prevenção de escalonamento de privilégio e auditoria de mudanças.
- A implementação não pode migrar todas as entidades de uma vez; será feita em blocos reversíveis.

## Segurança, privacidade e multitenancy

- IDs de tenants e domínios públicos usam UUID/ULID ou identificador opaco.
- Todas as ações de plataforma e gestão de equipe são auditáveis com ator, tenant-alvo, ação e resultado.
- Um usuário de tenant não vê dados, menus, métricas ou erros de outro tenant.
- Cache, arquivos, jobs, eventos e unicidades usam o tenant resolvido.
- Superadmin não recebe secrets completos de tenants por padrão.
- Nenhuma autorização depende apenas da ocultação de menu no frontend.

## Migração e compatibilidade

A transição seguirá expand/migrate/contract:

1. criar tenants, domínios e contexto sem alterar o comportamento atual;
2. criar memberships, cargos e permissões sem remover a role legada;
3. adicionar `tenant_id`, backfill, constraints e escopos por módulo;
4. migrar rotas administrativas para policies de membership;
5. remover a dependência de `users.role` apenas após cobertura de testes e validação de produção.

Nenhuma migration publicada será reescrita para acomodar esta mudança. Bancos existentes receberão migrations novas, idempotentes quando necessário, com estratégia de backfill e rollback documentada.

## Plano de rollback

Cada bloco de migração deve ser compatível com o código anterior durante a janela de implantação. Se uma etapa falhar:

- interromper a ativação do novo fluxo;
- preservar a leitura do legado enquanto não houver contração de schema;
- reverter apenas o código/feature flag do bloco;
- nunca remover `tenant_id` ou memberships com dados já utilizados sem backup e plano aprovado.

## Critérios de validação

- A estratégia shared-schema está registrada e aceita.
- Superadmin é definido como autoridade de plataforma separada de roles de tenant.
- Membership, cargos customizados, permissões e menus seguem o modelo desta ADR.
- O task board mantém TEN-002 como próximo passo de implementação.
- Todas as migrations futuras de tenant declaram backfill, índices e rollback.
