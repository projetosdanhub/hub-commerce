# ADR-0001: modular monolith como arquitetura da aplicação

- Status: aceita
- Data: 2026-09-02
- Responsável: HUB Commerce

## Contexto

O HUB Commerce reúne Storefront, painel administrativo, catálogo, clientes, pedidos, pagamentos, logística, tracking e configurações em uma aplicação Laravel com frontend React. O código atual ainda possui controllers e componentes extensos, conceitos duplicados e dependências diretas entre áreas públicas e administrativas.

A plataforma precisa evoluir para SaaS multitenant sem aumentar desnecessariamente a complexidade operacional.

## Problema

Precisamos definir uma arquitetura que:

- torne propriedade de dados e dependências explícitas;
- permita isolamento multitenant;
- reduza controllers e componentes monolíticos;
- suporte pagamentos e estoque com integridade;
- continue simples de desenvolver, testar e implantar;
- permita extração futura de serviços somente quando houver evidência.

## Decisão

A aplicação será um modular monolith.

Laravel continuará sendo uma única aplicação implantável, organizada em módulos de domínio com fronteiras claras. Storefront e Admin podem possuir entradas/bundles próprios, mas usam contratos do mesmo backend.

Módulos iniciais:

- Identity;
- Tenancy;
- Catalog;
- Inventory;
- Customers;
- Orders;
- Payments;
- Shipping;
- Storefront;
- Marketing;
- Tracking;
- Settings;
- Shared Kernel mínimo.

Cada módulo é proprietário das suas regras e dados. Outros módulos interagem por Actions/Services públicos, DTOs, eventos ou interfaces. Acesso direto a detalhes internos de outro módulo é proibido.

## Regras estruturais

1. Controllers pertencem à camada de entrega e permanecem finos.
2. Casos de uso ficam em Actions ou Services do módulo.
3. Policies fazem autorização sobre recursos.
4. FormRequests validam e autorizam a entrada inicial.
5. Resources/DTOs definem contratos de saída.
6. Integrações externas ficam atrás de interfaces e adapters.
7. Jobs carregam identificadores e contexto, não objetos ou segredos desnecessários.
8. Eventos internos representam fatos concluídos e não substituem transações.
9. Shared Kernel contém somente tipos realmente transversais, sem regras de domínio.
10. Nenhum módulo público depende de controller ou componente administrativo.

## Organização alvo

A migração será incremental. Novos casos de uso podem adotar estrutura por domínio, enquanto o legado é movido somente durante tarefas aprovadas.

Exemplo backend:

    app/Domain/Catalog/
      Actions/
      DTOs/
      Enums/
      Events/
      Models/
      Policies/
      Queries/
      Services/

Exemplo frontend:

    resources/js/apps/admin/
    resources/js/apps/storefront/
    resources/js/features/
    resources/js/shared/ui/

A estrutura final pode ser refinada por ADR sem alterar as fronteiras definidas aqui.

## Direção de dependências

- Camadas de entrega dependem de casos de uso.
- Casos de uso dependem do domínio e de interfaces.
- Adapters dependem das interfaces que implementam.
- Domínio não depende de React, HTTP, controllers ou detalhes de fornecedor.
- Storefront e Admin não importam código um do outro.
- Dependências circulares entre módulos são proibidas.

## Multitenancy

Tenancy será uma capacidade transversal fornecida por contexto explícito e contratos, não por acesso global invisível. A escolha definitiva de estratégia de banco, constraints e backfill será registrada na Fase 3 em ADR própria.

Até essa decisão, nenhuma implementação deve presumir database-per-tenant ou shared-schema sem registrar o trade-off.

## Alternativas consideradas

### Manter estrutura atual por controllers e telas

Rejeitada porque mantém acoplamento, duplicação e baixa testabilidade.

### Microserviços imediatos

Rejeitada porque adicionaria rede, observabilidade distribuída, consistência eventual e operação complexa antes de existirem limites de domínio estáveis.

### Repositórios independentes para Admin e Storefront agora

Adiada. Bundles separados são desejáveis, mas repositórios separados não resolvem as fronteiras do backend e aumentam coordenação.

## Consequências positivas

- Uma implantação e uma transação de banco continuam simples.
- Limites de domínio passam a ser testáveis.
- Migração gradual sem reescrita total.
- Extração futura de serviço pode seguir fronteiras já definidas.
- Menor risco operacional durante a transformação multitenant.

## Riscos e consequências negativas

- O framework não impede sozinho violações entre módulos.
- Exige disciplina, testes de arquitetura e revisão.
- O legado coexistirá temporariamente com a estrutura alvo.
- Shared Kernel pode virar depósito genérico se não for controlado.

## Migração

1. Criar testes de baseline.
2. Corrigir modelos e contratos duplicados.
3. Introduzir módulo Tenancy e Identity.
4. Migrar um caso de uso por vez.
5. Criar adapters para integrações.
6. Separar bundles Admin e Storefront.
7. Adicionar testes automatizados de dependência.

## Rollback

Como a migração é incremental, cada mudança deve preservar uma rota de rollback. Novas camadas podem delegar ao legado durante transição, desde que isso seja temporário, testado e registrado no task board.

## Critérios de validação

- Mapa de domínios publicado.
- Regras de dependência documentadas.
- Nenhuma nova lógica de negócio extensa em controller/página.
- Novos fornecedores implementados por adapter.
- Testes impedem dependências proibidas.
- Mudanças estruturais referenciam esta ADR.
