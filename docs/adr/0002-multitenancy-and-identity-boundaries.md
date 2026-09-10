# ADR-0002: Multitenancy shared-schema e fronteiras de autoridade

- Status: Aceita
- Data: 2026-09-02
- Responsáveis: Responsável do HUB Commerce

## Contexto

O HUB Commerce evoluirá de uma aplicação de loja única para uma plataforma SaaS B2B multitenant. Cada loja precisa ter dados, domínio, configurações, equipe, catálogo, pedidos, integrações e permissões isolados.

A plataforma possui dois planos independentes de autoridade:

1. **Plataforma (landlord)**: gerencia o próprio HUB Commerce, seus tenants, planos, cobrança, bloqueios, suporte e equipe interna.
2. **Tenant (loja)**: gerencia uma loja específica, sua equipe, catálogo, pedidos, clientes e configurações.

O campo legado `users.role` representa uma autorização global de aplicação única e não suporta com segurança usuários em múltiplos tenants, cargos customizados ou permissões por menu.

## Problema

Sem uma separação explícita entre autoridade de plataforma, vínculo com a loja e cargo da loja, um usuário pode obter acesso cruzado entre tenants ou um lojista pode, por engano, receber poderes de plataforma.

A plataforma também precisa permitir que cada lojista crie cargos para seus setores e controle o acesso a menus e submenus, sem permitir que ele invente rotas, permissões sensíveis ou privilégios acima da própria autorização.

## Decisão

### Estratégia de dados

A plataforma adotará **banco compartilhado e schema compartilhado**, com `tenant_id` obrigatório nas entidades tenant-owned.

Dados de plataforma incluem:

- `users`: identidade global;
- `tenants` e `tenant_domains`;
- memberships, cargos e permissões da equipe interna;
- catálogo canônico de permissões de aplicação;
- planos, billing, suporte, risco, auditoria e configurações globais.

Dados de uma loja incluem, por padrão, catálogo, pedidos, clientes, configurações, integrações, tracking, arquivos, cache, equipe e cargos.

### Autoridade da plataforma

O **superadmin** é o dono e a autoridade máxima do HUB Commerce. Ele administra tenants, estado da conta, planos, cobrança dos lojistas, recursos da plataforma, suporte, risco e auditoria. Essa autoridade é separada de qualquer cargo de loja:

- não é concedida por header, parâmetro de rota ou payload controlado pelo cliente;
- não é editável por lojistas;
- usa guard/ability e trilha de auditoria próprios;
- não recebe automaticamente acesso operacional a uma loja: qualquer atuação em tenant exige contexto explícito e auditoria;
- não recebe secrets completos de tenants por padrão.

A plataforma também terá **cargos internos customizáveis**, por exemplo `financeiro_da_plataforma`, `suporte` ou `operacoes`. Eles serão modelados por memberships e roles de plataforma, usando o mesmo catálogo canônico de permissões, porém em namespace próprio, como `platform.billing.view` e `platform.tenants.suspend`.

Somente um superadmin ativo pode criar, conceder, revogar ou alterar cargos de plataforma. Um colaborador de plataforma só pode executar capacidades explicitamente concedidas; cargo de plataforma não concede acesso implícito aos dados operacionais de uma loja.

A coluna legada `users.role` não será a fonte de autoridade do superadmin após a migração para Identity/Tenancy.

### Equipe, cargos e permissões do tenant

A autorização dentro de uma loja será modelada por:

- `tenant_memberships`: vínculo entre `user_id` e `tenant_id`, com status;
- `tenant_roles`: cargos próprios de cada loja;
- `permissions`: capacidades canônicas definidas pela plataforma, por exemplo `catalog.view`, `catalog.manage`, `orders.view` e `settings.manage`;
- `tenant_role_permissions`: associação entre cargo e capacidade;
- cargos de sistema como `owner` e `admin`, protegidos contra exclusão ou alteração indevida.

O lojista proprietário e administradores autorizados podem criar contas e cargos dentro do próprio tenant, apenas se possuírem as permissões de gestão de equipe e cargos. A delegação não pode conceder capacidade de plataforma, permissão fora do catálogo ou capacidade que exceda a autorização delegável do ator.

Menus e submenus serão definidos pela aplicação; sua visibilidade será derivada das permissões concedidas no backend. Nenhum tenant poderá cadastrar rotas arbitrárias, chaves de permissão globais ou esconder a verificação de autorização apenas no frontend.

### Proprietário inicial da loja

Na criação de cada tenant, o primeiro administrador é registrado como **owner protegido**:

- existe exatamente um owner ativo por tenant;
- nenhum membro do tenant, inclusive outro `admin`, pode excluir, desativar, remover cargos ou reduzir as permissões do owner;
- somente um superadmin ativo pode suspender, remover ou transferir a titularidade;
- remoção definitiva do owner exige, na mesma operação auditada, transferir a titularidade a outro membership ativo ou suspender o tenant; o sistema nunca deixa tenant operacional sem owner;
- toda criação, transferência, suspensão e tentativa negada é registrada em auditoria com ator, tenant, alvo e resultado.

Assim, `admin` é um papel administrativo da loja, enquanto `owner` é uma proteção de titularidade e não apenas um conjunto de permissões.

### Contexto e resolução

- A vitrine resolve o tenant pelo domínio verificado.
- O painel da loja opera com um tenant ativo que pertence ao usuário autenticado.
- O painel geral usa domínio/rota de plataforma e nunca aceita seleção de tenant controlada pelo navegador como prova de autorização.
- Toda leitura e escrita tenant-owned recebe `TenantContext` imutável antes de consultar dados.
- Trocar de loja exige membership válido, tenant ativo e registro de auditoria quando aplicável.

## Alternativas consideradas

### Manter `users.role` como fonte de autorização

Rejeitada. Uma role global única não representa participação em múltiplas lojas e permite confundir um administrador de loja com autoridade da plataforma.

### Criar uma tabela de usuários por tenant

Rejeitada. Duplicaria identidade, complicaria login, recuperação de senha, convites e suporte a um usuário com acesso a mais de uma loja.

### Permitir cargos e menus livres por tenant

Rejeitada. Um tenant não pode criar endpoints, permissões globais ou regras de autorização. Cargos são customizáveis, mas usam catálogo canônico de capacidades e menus definidos pela aplicação.

### Banco ou schema exclusivo por tenant

Adiada. Essa opção aumenta custo operacional, migrações e observabilidade antes de a plataforma validar seus limites de domínio. Uma mudança futura exige nova ADR e plano de migração.

## Consequências positivas

- Um usuário pode participar de várias lojas sem duplicar conta.
- A equipe interna pode operar finanças, suporte e operações sem receber superadmin.
- Superadmin fica separado da administração do lojista.
- O owner da loja não pode ser removido por um administrador comum.
- Cargos por setor suportam operação real sem expor privilégios de plataforma.
- Menus e submenus obedecem à mesma autorização server-side das APIs.

## Riscos e consequências negativas

- Shared-schema exige disciplina rigorosa de `tenant_id`, índices, scopes, cache, filas e testes negativos.
- A transição do legado precisará conviver temporariamente com `users.role`.
- Cargos customizados exigem prevenção de escalonamento de privilégio e auditoria de mudanças.
- A implementação deve migrar entidades em blocos reversíveis.

## Segurança, privacidade e multitenancy

- IDs públicos de tenants e domínios usam UUID/ULID ou identificador opaco.
- Ações de plataforma e gestão de equipe são auditáveis com ator, escopo, ação, alvo e resultado.
- Um usuário de tenant não vê dados, menus, métricas ou erros de outro tenant.
- Cache, arquivos, jobs, eventos e unicidades usam o tenant resolvido.
- Nenhuma autorização depende apenas da ocultação de menu no frontend.
- Falhas de autorização são deny-by-default.

## Migração e compatibilidade

A transição seguirá expand/migrate/contract:

1. criar tenants, domínios e contexto sem alterar o comportamento atual;
2. criar memberships, cargos e permissões de plataforma e tenant sem remover a role legada;
3. adicionar `tenant_id`, backfill, constraints e escopos por módulo;
4. migrar rotas administrativas para policies de membership;
5. remover a dependência de `users.role` apenas após cobertura de testes e validação de produção.

Nenhuma migration publicada será reescrita. Bancos existentes receberão migrations novas, idempotentes quando necessário, com estratégia de backfill e rollback documentada.

## Plano de rollback

Cada bloco de migração deve ser compatível com o código anterior durante a janela de implantação. Se uma etapa falhar:

- interromper a ativação do novo fluxo;
- preservar a leitura do legado enquanto não houver contração de schema;
- reverter apenas o código/feature flag do bloco;
- nunca remover `tenant_id`, memberships ou titularidade com dados já utilizados sem backup e plano aprovado.

## Critérios de validação

- A estratégia shared-schema está registrada e aceita.
- Superadmin, equipe da plataforma e cargos de tenant estão separados.
- O owner inicial possui proteção contra exclusão por administrador de loja.
- Membership, cargos customizados, permissões e menus seguem este modelo.
- Todas as migrations futuras de tenant declaram backfill, índices e rollback.
