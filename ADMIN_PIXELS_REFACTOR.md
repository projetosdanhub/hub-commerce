# ADMIN_PIXELS_REFACTOR.md

## Contexto

Refatorar completamente o módulo:

`@AdminPixels.jsx`

Usar obrigatoriamente como base:

- `@MASTER_ADMIN_UI_UX_REFACTOR.md`
- `@ui-ux-guidelines.md`
- código atual de `AdminPixels.jsx` e todos os componentes, hooks, services, schemas, stores e integrações diretamente relacionados

As telas atuais mostram que o módulo já possui uma base funcional importante: `Funil e Métricas`, `App Store`, `Data Layer`, catálogo de métricas, métricas/eventos ativos, filtros, refresh, Meta Pixel + CAPI, GA4, TikTok, Pinterest, eventos nativos, payloads e regras personalizadas/GTM.

A missão não é reescrever tudo do zero. É transformar essa base em uma **Central de Tracking / CDP operacional, confiável e escalável**, preservando integralmente as regras de negócio existentes.

---

# 1. Missão do módulo

Transformar `AdminPixels.jsx` em um verdadeiro **Tracking Operations Center** do e-commerce.

A interface deve permitir responder rapidamente:

- quais provedores estão conectados;
- quais precisam de atenção;
- quais eventos estão chegando;
- quais eventos falharam;
- se browser e servidor estão enviando corretamente;
- se existe deduplicação;
- se o payload está completo;
- se a qualidade de match está adequada;
- quando ocorreu o último evento;
- qual é a latência;
- se existe divergência entre provedores;
- se consentimento e privacidade estão sendo respeitados;
- quais alterações de tracking estão pendentes;
- quem alterou determinada configuração;
- como testar uma integração sem afetar produção.

---

# 2. Auditoria obrigatória antes de codar

Antes de modificar qualquer arquivo:

1. Ler integralmente `@AdminPixels.jsx`, `@MASTER_ADMIN_UI_UX_REFACTOR.md` e `@ui-ux-guidelines.md`.
2. Descobrir e ler componentes filhos, hooks, services, stores/context, schemas, rotas, configuração de providers, helpers de eventos, código de Data Layer, browser-side, server-side/CAPI, persistência de tokens, endpoints, deduplicação, consentimento, logs e permissões.
3. Mapear claramente:
   - já suportado;
   - implementável somente no front;
   - dependente de backend;
   - regra crítica que não pode ser alterada.
4. Não excluir algo apenas porque não aparece nas screenshots.
5. Fazer um plano curto e começar a implementação.

---

# 3. Direção visual

Manter a identidade do HUB e preservar o padrão aprovado de **menu afundado/recessed navigation**.

Refinar o módulo para:

- reduzir áreas vazias excessivas;
- melhorar densidade operacional;
- padronizar ícones, botões, inputs, status e tabelas;
- reduzir cores decorativas;
- usar cores principalmente para estados semânticos;
- melhorar hierarquia entre configuração, status e diagnóstico;
- evitar cards gigantes para poucos campos;
- tratar o módulo como uma ferramenta técnica profissional.

---

# 4. Arquitetura principal

Manter as três áreas, evoluindo suas responsabilidades:

## Funil e Métricas

- dashboard;
- KPIs;
- funil;
- saúde do tracking;
- comparação entre providers;
- diagnóstico.

## App Store / Integrações

Responsável por:

- configurar providers;
- credenciais;
- browser-side;
- server-side;
- teste de conexão;
- status;
- eventos suportados;
- diagnóstico.

Pode manter o label `App Store` se fizer parte da nomenclatura do produto, mas deixar evidente que se trata de integrações de tracking.

## Data Layer

Responsável por:

- catálogo canônico de eventos;
- mapeamento para providers;
- payloads;
- enriquecimento;
- regras personalizadas;
- gatilhos;
- testes;
- validação.

---

# 5. Header do módulo

Estrutura sugerida:

```text
[ícone] Tracking Hub
Coleta, validação, qualidade e distribuição de eventos.

                           [Atualizado há 38s] [↻] [Catálogo]
```

O refresh deve possuir:

- loading;
- bloqueio contra cliques repetidos;
- timestamp da última atualização;
- erro;
- feedback discreto de sucesso.

Se houver suporte real, preparar auto-refresh opcional: `30 s`, `1 min`, `5 min`, `Pausado`.

---

# 6. Navegação afundada

Preservar:

```text
Funil e Métricas | App Store | Data Layer
```

Requisitos:

- aba ativa elevada dentro do trilho;
- teclado;
- foco visível;
- `aria-selected`;
- contraste acessível;
- scroll horizontal em telas menores;
- sem uma cor diferente por aba apenas por decoração.

---

# 7. Dashboard operacional

Evoluir `Seu Dashboard Personalizado`.

## KPIs recomendados

Quando houver dados reais:

- Receita Bruta Atribuída;
- Receita Líquida;
- Pedidos/Conversões;
- Ticket Médio;
- Taxa de Conversão;
- Eventos recebidos;
- Eventos browser-side;
- Eventos server-side;
- taxa de sucesso de entrega;
- qualidade de match;
- cobertura de deduplicação;
- latência média.

Não inventar métricas sem backend.

## Saúde do Tracking

Criar um bloco operacional, por exemplo:

```text
Saúde do Tracking

✓ Meta conectado
✓ GA4 recebendo Purchase
! TikTok sem Events API
! Eventos críticos sem event_id suficiente
✓ Pinterest operacional
```

Se houver score, ele deve ser objetivo e transparente.

---

# 8. Filtros

## Provider

Suportar dinamicamente os providers reais, como:

- Todos;
- Meta;
- GA4;
- TikTok;
- Pinterest.

Não hardcodar providers em vários componentes. Usar registry/configuração central.

## Período

Implementar o padrão mestre:

- Hoje;
- Ontem;
- Últimos 7 dias;
- Últimos 30 dias;
- Este mês;
- Mês anterior;
- Este trimestre;
- Este ano;
- Personalizado.

Personalizado:

- Data inicial;
- Data final;
- Limpar;
- Aplicar.

Quando suportado, permitir comparação com período anterior, mesmo período do ano anterior ou período customizado.

## Filtros avançados

Criar popover/drawer para:

- provider;
- evento;
- origem browser/server;
- status sucesso/warning/erro;
- domínio;
- ambiente produção/staging/teste;
- regra personalizada;
- estado de consentimento quando persistido.

Mostrar filtros ativos como chips removíveis.

---

# 9. Funil Real de Eventos

Transformar a área atual em funil configurável.

Fluxo de e-commerce quando os eventos existirem:

```text
PageView
↓
ViewContent / view_item
↓
AddToCart / add_to_cart
↓
InitiateCheckout / begin_checkout
↓
AddPaymentInfo / add_payment_info
↓
Purchase / purchase
```

Não usar o nome de um provider como taxonomia interna.

Criar evento canônico do HUB e mapear para cada provider.

A tela pode mostrar:

- volume por etapa;
- conversão entre etapas;
- drop-off;
- comparação temporal;
- provider;
- browser/server.

---

# 10. Catálogo de Tracking

Atualmente há conceitos próximos de `Catálogo de Métricas` e `Métricas e Eventos Ativos`.

Unificar a linguagem visual em um **Catálogo de Tracking**, com abas internas quando fizer sentido:

```text
Métricas | Eventos
```

Se forem fluxos funcionalmente distintos, manter separados no comportamento, mas compartilhar shell e UX.

---

# 11. Catálogo de Métricas

Adicionar:

- busca;
- categorias;
- favoritos;
- métricas ativas;
- métricas disponíveis;
- disponibilidade de dados.

Categorias possíveis:

- Executivo;
- Receita;
- Conversão;
- Funil;
- Qualidade de Tracking;
- Providers;
- Clientes;
- E-commerce;
- Diagnóstico.

No detalhe mostrar:

- nome;
- descrição;
- fórmula;
- unidade;
- fonte;
- frequência de atualização;
- filtros compatíveis;
- providers envolvidos;
- dependências.

---

# 12. Métricas e Eventos Ativos

A seleção por checkbox é útil. Evoluir com:

- busca;
- categorias;
- selecionar todos da categoria;
- limpar seleção;
- contador de ativos;
- reordenação;
- preview do dashboard;
- indicação de falta de dados.

Quando adequado, usar `Alterações não salvas` e ação explícita de salvar, evitando requests desnecessários por clique.

---

# 13. Integrações / App Store

Padronizar cada provider.

Exemplo:

```text
Meta Pixel & Conversions API

Status: Requer atenção
Browser: configurado
Servidor: não validado
Último evento: há 2 min

[Configurar] [Testar conexão]
```

Ao abrir detalhes:

- identificadores;
- credenciais;
- conexão;
- eventos;
- diagnóstico;
- segurança.

Preferir accordion/drawer/detalhe contextual em vez de todos os campos de todos os providers abertos simultaneamente.

---

# 14. Estados de integração

Padronizar:

- Não configurado;
- Configuração incompleta;
- Validando;
- Conectado;
- Requer atenção;
- Erro;
- Token inválido/expirado.

Mostrar sempre a causa e a próxima ação.

---

# 15. Teste de conexão

Adicionar `Testar conexão` quando o backend permitir.

Validar, conforme provider:

- credencial;
- permissão;
- endpoint;
- formato;
- resposta.

Nunca expor resposta contendo segredo.

---

# 16. Segurança de tokens

Auditar imediatamente:

- tokens retornados ao browser;
- tokens em state;
- tokens em logs;
- localStorage/sessionStorage;
- persistência;
- exposição em requests.

Diretrizes:

- mascarar tokens;
- não logar segredo;
- permitir substituir sem revelar o valor atual;
- preferir armazenamento seguro no backend;
- auditar troca de credencial sem registrar conteúdo;
- não colocar API secret no client.

Se a arquitetura atual não atender, registrar como risco e dependência de backend.

---

# 17. Salvamento

Revisar `Salvar Todos os Tokens`.

Se o backend exige salvamento global, preservar, mas melhorar UX:

```text
Salvar alterações
↓
Salvando...
↓
✓ Alterações salvas
```

- habilitar apenas quando houver mudança;
- não fechar página;
- não resetar aba;
- não limpar inputs;
- exibir erro útil;
- usar toast.

---

# 18. Meta Pixel + CAPI

Preservar a integração atual e revisar suporte a:

- Pixel ID;
- Access Token;
- browser events;
- server events;
- `event_id`;
- deduplicação;
- `event_name`;
- timestamp;
- source URL;
- dados de usuário permitidos;
- custom data;
- value/currency;
- content IDs;
- order context.

Quando houver dados, mostrar:

- Browser ativo?;
- Server ativo?;
- cobertura Browser + Server;
- cobertura de `event_id`;
- deduplicação;
- qualidade de match;
- freshness;
- último erro.

Não criar score falso se o provider/API não fornecer o dado.

---

# 19. Google Analytics 4

Revisar suporte a:

- Measurement ID;
- Measurement Protocol;
- API Secret server-side;
- client/session context;
- `transaction_id`;
- `items[]`;
- `value`;
- `currency`;
- eventos recomendados de e-commerce.

Mapear eventos internos para eventos GA4 quando fizer sentido.

Para Purchase, manter `transaction_id` consistente quando usado para evitar duplicidade.

Nunca expor API Secret no front-end.

---

# 20. Consentimento Google

Preparar arquitetura para Consent Mode atual quando o HUB controlar o tracking do storefront.

Estados relevantes:

- `analytics_storage`;
- `ad_storage`;
- `ad_user_data`;
- `ad_personalization`.

A UI pode informar se a integração de consentimento está configurada/detectada.

Não definir política legal arbitrariamente. Consentimento depende da CMP e da orientação jurídica do negócio.

---

# 21. TikTok

Preparar suporte para:

- Pixel;
- Events API;
- Pixel + Events API;
- Pixel ID;
- Access Token;
- browser/server;
- deduplicação;
- match keys;
- diagnóstico;
- test events;
- parâmetros de e-commerce.

Exemplo de status:

```text
Browser       Ativo
Events API    Ativo
Deduplicação  OK
```

Não tratar TikTok apenas como `Pixel ID`.

---

# 22. Pinterest

Preparar suporte para:

- Pinterest Tag;
- Conversions API;
- Pixel/Tag ID;
- Access Token;
- `event_id`;
- deduplicação;
- action source;
- event source URL;
- qualidade do evento;
- testes.

Quando browser e API enviarem a mesma conversão, utilizar o mesmo identificador de evento quando exigido para deduplicação.

---

# 23. Provider Registry

Se ainda não existir, criar configuração central de providers.

Cada provider deve declarar:

- id;
- label;
- capabilities;
- credenciais necessárias;
- eventos suportados;
- campos obrigatórios;
- browser/server;
- diagnóstico;
- status.

Evitar espalhar `if (provider === ...)` por toda a página.

---

# 24. Event Registry canônico

Criar/revisar registry central de eventos do HUB, por exemplo:

- PAGE_VIEW;
- VIEW_CONTENT;
- SEARCH;
- ADD_TO_CART;
- ADD_TO_WISHLIST;
- BEGIN_CHECKOUT;
- ADD_PAYMENT_INFO;
- PURCHASE;
- COMPLETE_REGISTRATION;
- LEAD;
- CONTACT;
- SUBSCRIBE.

Cada evento deve ter:

- nome interno;
- descrição;
- categoria;
- prioridade;
- schema;
- obrigatórios;
- recomendados;
- providers suportados;
- mapeamento por provider;
- versão.

---

# 25. Eventos Nativos

A tabela atual é uma boa base.

Evoluir para:

```text
Evento | Disparo | Providers | Payload | Status | Saúde
```

Adicionar quando suportado:

- busca;
- filtro por categoria;
- ativo/inativo;
- provider;
- status de validação;
- edição em lote.

`Desligar Todos` é ação de alto impacto e deve pedir confirmação clara.

---

# 26. Payload Inspector

Substituir `PAYLOAD VIP` por nomenclatura semântica:

`Ver payload`

Se VIP representa plano, separar o entitlement do nome da ação.

Ao abrir:

- campo;
- tipo;
- exemplo;
- origem;
- obrigatório/opcional;
- providers;
- privacidade;
- transformação.

Adicionar visualização JSON como modo técnico secundário.

---

# 27. Payload Builder

Reorganizar o builder atual.

## Evento

- event_id;
- event_time;
- source_url;
- action_source;
- browser/session IDs.

## Cliente

- email;
- telefone;
- nome;
- sobrenome;
- cidade;
- estado;
- país;
- CEP;
- user_id.

## Comércio

- value;
- currency;
- product IDs;
- item name;
- quantity;
- order ID;
- search term;
- subscription ID.

## Contexto

- UTM;
- referrer;
- device;
- user agent;
- landing page;
- campaign.

Somente exibir dados realmente suportados.

---

# 28. PII e hashing

Antes de alterar tratamento de dados pessoais:

- verificar exigência de cada provider;
- normalização;
- hashing;
- campos permitidos;
- consentimento;
- política do negócio.

Nunca assumir que todo campo deve ser SHA-256 nem que todo campo pode ser enviado.

Não exibir PII real em previews quando valores mascarados forem suficientes.

---

# 29. Regras personalizadas / GTM

Preservar os gatilhos atuais e melhorar a UX:

- HTML Element / Click;
- URL;
- Scroll Depth;
- Time Delay;
- Form Submit;
- Element Visible.

Campos devem mudar conforme o gatilho.

Exemplos:

- click: seletor CSS/ID/classe + validação;
- URL: contém/igual/começa com/regex, se suportado;
- scroll: percentual;
- delay: segundos;
- form: seletor/ID;
- visible: seletor + threshold, se suportado.

Não adicionar opção que o runtime atual não sabe executar.

---

# 30. Editor de regra

Reestruturar o fluxo:

```text
← Voltar para regras

Nome da regra
Evento HUB
Status
Gatilho
Condição
Payload
Teste

[Salvar alterações]
```

Salvar mantém o usuário na tela.

Depois do primeiro save, permanecer em modo edição.

Adicionar proteção de alterações não salvas.

---

# 31. Testar Regra

Incremento de alta prioridade quando houver backend/runtime.

Adicionar:

`Testar regra`

Exibir:

- gatilho reconhecido;
- evento gerado;
- payload final;
- providers que receberiam;
- campos ausentes;
- warnings;
- erros.

Não enviar conversão real em modo de teste sem mecanismo explícito de test event/sandbox.

---

# 32. Event Debugger / Live Monitor

Grande incremento recomendado.

Criar área/drawer:

**Eventos em Tempo Real**

Mostrar:

- timestamp;
- evento interno;
- provider;
- browser/server;
- status;
- event_id;
- latência;
- ambiente.

Detalhe:

```text
Evento: PURCHASE
event_id: evt_...
Origem: server
Meta: entregue
TikTok: entregue
GA4: entregue
Pinterest: warning
```

Payload sempre mascarado quando houver PII.

Se backend não possuir event log, marcar como P1 dependente de backend.

---

# 33. Central de Diagnósticos

Criar conceito unificado de diagnóstico.

Alertas possíveis:

- token inválido;
- nenhuma atividade recente;
- Purchase ausente;
- evento duplicado;
- event_id ausente;
- browser/server divergentes;
- currency ausente;
- value inválido;
- product ID ausente;
- PII inválida;
- payload incompleto;
- timeout;
- rate limit;
- provider indisponível;
- consentimento bloqueando;
- domínio inválido.

Cada alerta deve dizer:

1. problema;
2. impacto;
3. como corrigir;
4. quais eventos/providers estão afetados.

---

# 34. Deduplicação

Tratar deduplicação como recurso de primeira classe.

Para a mesma ação enviada via browser e servidor:

- gerar/reutilizar identificador estável;
- mapear para o campo correspondente de cada provider;
- impedir IDs diferentes para a mesma conversão quando o provider depende de correspondência;
- medir cobertura quando houver dados.

Para Purchase, manter também o identificador transacional exigido pelo provider.

---

# 35. Entrega server-side

Se houver pipeline server-side, auditar:

- retries;
- idempotência;
- timeout;
- rate limit;
- filas;
- dead-letter;
- logs;
- backoff;
- duplicidade.

Não implementar infraestrutura no front-end. Marcar dependências.

---

# 36. Event Quality

Criar abstração de qualidade sem fingir que todos os providers calculam a mesma coisa.

Mostrar sinais como:

- match quality;
- completeness;
- dedup coverage;
- freshness;
- delivery rate;
- missing keys.

Nunca misturar scores diferentes em um número único sem metodologia explícita.

---

# 37. Comparação entre providers

Quando houver dados suficientes, permitir comparação operacional, por exemplo:

```text
Purchase no período

HUB       1.024
Meta        996
GA4       1.011
TikTok      987
Pinterest   971
```

Mostrar diferença percentual, deixando claro que atribuição e coleta podem divergir entre plataformas.

---

# 38. Fonte de verdade das métricas

Distinguir claramente:

- receita do e-commerce/HUB;
- receita atribuída por provider;
- receita observada nos eventos;
- receita líquida de pedidos.

No catálogo de métricas sempre mostrar a fonte.

---

# 39. Ambientes

Preparar suporte a:

- Produção;
- Staging;
- Teste.

Evitar que eventos de desenvolvimento contaminem produção.

Se o backend não suportar, registrar como dependência.

---

# 40. Versionamento e publicação

Para regras de tracking, considerar arquitetura futura:

```text
Editar
↓
Salvar rascunho
↓
Testar
↓
Publicar
```

Se hoje salvar publica imediatamente, preservar o comportamento e documentar a evolução.

---

# 41. Auditoria

Registrar quando suportado:

- provider alterado;
- token substituído;
- evento ativado/desativado;
- regra criada/editada;
- payload modificado;
- publicação;
- ator;
- timestamp.

Nunca registrar o conteúdo do segredo.

---

# 42. Consentimento e governança

Preparar metadata por campo/evento:

- categoria;
- PII;
- finalidade;
- providers permitidos;
- consentimento necessário;
- transformação.

Para Google, considerar Consent Mode.

Para outros providers, respeitar as respectivas configurações de privacidade e opt-out suportadas.

---

# 43. Data Layer como contrato versionado

Criar/usar schema com:

- nome do evento;
- versão;
- tipos;
- required;
- optional;
- transforms;
- exemplos.

Exemplo conceitual:

```text
PURCHASE v2

event_id       string   required
event_time     number   required
currency       string   required
value          number   required
order_id       string   required
items[]        array    required
user_data      object   optional/conditional
```

Validar antes de distribuir.

---

# 44. Cobertura do e-commerce

Auditar se o catálogo cobre, quando aplicável:

- PageView;
- ViewContent / view_item;
- ViewItemList;
- SelectItem;
- Search;
- AddToWishlist;
- AddToCart;
- RemoveFromCart;
- ViewCart;
- BeginCheckout;
- AddShippingInfo;
- AddPaymentInfo;
- Purchase;
- Refund;
- CompleteRegistration;
- Lead;
- Contact;
- Subscribe.

Não ativar eventos que o storefront não gera.

---

# 45. Freshness

Além do refresh, mostrar quando houver dados:

```text
Último evento recebido: há 14 s
Meta CAPI: há 18 s
GA4: há 12 s
TikTok: há 21 s
Pinterest: há 20 s
```

---

# 46. Estados vazios

Exemplo:

```text
Nenhum evento recebido neste período

Verifique o período selecionado ou envie um evento de teste.

[Alterar período] [Abrir diagnóstico]
```

Regras:

```text
Nenhuma regra personalizada

Os eventos nativos já cobrem os principais fluxos.
Crie uma regra apenas quando precisar de um gatilho específico.

[+ Nova regra]
```

---

# 47. Loading e erro

Toda área deve tratar:

- skeleton;
- erro;
- retry;
- vazio;
- sucesso.

Durante refresh, preferir manter os dados atuais visíveis e sinalizar atualização em andamento.

---

# 48. Acessibilidade e responsividade

Aplicar `@MASTER_ADMIN_UI_UX_REFACTOR.md` integralmente.

Especial atenção a:

- switches;
- checkboxes;
- tabs;
- dialogs;
- drawers;
- tooltips;
- tabelas;
- payload inspector;
- status de integração.

Em mobile:

- tabs com scroll;
- provider cards empilhados;
- filtros em drawer;
- dialogs técnicos podendo virar full-screen sheet;
- ações críticas sempre acessíveis.

---

# 49. Arquitetura sugerida

Adaptar ao projeto atual, sem seguir cegamente:

```text
AdminPixels/
  AdminPixelsPage.jsx

  dashboard/
    TrackingDashboard.jsx
    TrackingHealth.jsx
    TrackingKpis.jsx
    FunnelAnalytics.jsx
    ProviderComparison.jsx

  integrations/
    IntegrationsPage.jsx
    ProviderCard.jsx
    ProviderDetails.jsx
    ProviderStatus.jsx
    ConnectionTest.jsx

  data-layer/
    DataLayerPage.jsx
    NativeEventsTable.jsx
    EventRegistry.jsx
    PayloadInspector.jsx
    PayloadBuilder.jsx
    MappingTable.jsx

  rules/
    RulesTable.jsx
    RuleEditor.jsx
    TriggerBuilder.jsx
    RuleTestPanel.jsx

  diagnostics/
    DiagnosticsCenter.jsx
    EventDebugger.jsx
    EventDetails.jsx

  catalog/
    TrackingCatalogDialog.jsx
    MetricsCatalog.jsx
    EventsCatalog.jsx

  filters/
    ProviderFilter.jsx
    DateRangeFilter.jsx
    TrackingFilters.jsx

  providers/
    registry.js
    meta.js
    ga4.js
    tiktok.js
    pinterest.js

  hooks/
  schemas/
  services/
  utils/
  constants/
```

---

# 50. Prioridades

## P0 — obrigatório

- refatoração visual completa;
- menu afundado refinado;
- header padronizado;
- refresh com estado/timestamp;
- filtro de período completo;
- provider filter refinado;
- filtros avançados;
- catálogo consistente;
- integrações padronizadas;
- status claros;
- SaveButton com estados;
- alterações não salvas;
- Data Layer reorganizado;
- criação de regra reorganizada;
- payload builder reorganizado;
- loading/empty/error;
- responsividade;
- acessibilidade.

## P1 — alta prioridade

- teste de conexão;
- saúde do tracking;
- event registry canônico;
- provider registry;
- mapeamento por provider;
- diagnósticos;
- deduplicação visível;
- Event Debugger;
- live monitor;
- status browser/server;
- freshness;
- ambientes;
- auditoria.

## P2 — evolução

- versionamento/publicação;
- rollback;
- auto-refresh;
- comparação de providers;
- discrepância de receita;
- saved views;
- custom dashboard;
- governança avançada;
- observabilidade server-side completa.

---

# 51. Regras não negociáveis

- preservar APIs e contratos;
- não mover segredo para o client;
- não inventar resposta de provider;
- não gerar métrica falsa;
- não criar mock no fluxo de produção;
- não expor PII em logs;
- não expor token em logs;
- não remover deduplicação existente;
- não mudar nomes de evento sem compatibilidade/mapeamento;
- não alterar Purchase sem revisar impactos;
- não ativar tracking ignorando consentimento aplicável;
- salvar não fecha a tela automaticamente;
- não duplicar implementação de providers sem necessidade.

---

# 52. Critérios de aceite

A refatoração está pronta quando:

- o layout foi reestruturado;
- regras existentes continuam funcionando;
- navegação está consistente;
- filtros funcionam;
- período possui presets + inicial/final;
- refresh possui feedback;
- integrações exibem estado claro;
- credenciais são tratadas com cuidado;
- salvar possui loading/sucesso/erro;
- alterações não salvas são protegidas;
- Data Layer ficou mais compreensível;
- regras personalizadas ficaram organizadas;
- payload pode ser inspecionado;
- vazios são úteis;
- loading/error estão completos;
- responsividade foi validada;
- acessibilidade foi validada;
- dependências de backend foram documentadas.

---

# 53. Entrega final esperada

Ao finalizar, informar resumidamente:

1. arquitetura encontrada;
2. arquivos alterados/criados;
3. principais melhorias;
4. regras preservadas;
5. integrações preservadas;
6. segurança revisada;
7. melhorias de UX;
8. melhorias de tracking;
9. itens dependentes de backend;
10. testes executados;
11. riscos/pendências.

Não entregar apenas mock ou recomendações.

Implementar no código real tudo que o backend atual permitir.

---

# 54. Comando final

Refatore completamente `@AdminPixels.jsx` seguindo integralmente:

- `@ADMIN_PIXELS_REFACTOR.md`
- `@MASTER_ADMIN_UI_UX_REFACTOR.md`
- `@ui-ux-guidelines.md`

Antes de alterar, audite o módulo e todas as dependências relevantes.

Preserve integralmente regras de negócio, APIs, integrações, segurança, eventos e contratos atuais.

Depois execute a refatoração progressivamente no código real.

Para funcionalidades sem backend, prepare a arquitetura quando fizer sentido, documente a dependência e não simule produção.
