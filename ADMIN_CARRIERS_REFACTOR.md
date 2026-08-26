# ADMIN_CARRIERS_REFACTOR.md

## Contexto

Refatorar completamente o módulo:

`@AdminCarriers.jsx`

Usar obrigatoriamente como base:

- `@MASTER_ADMIN_UI_UX_REFACTOR.md`
- `@ui-ux-guidelines.md`
- código atual de `AdminCarriers.jsx`
- todos os componentes, hooks, services, schemas, stores, rotas e integrações diretamente relacionados

O módulo atual já possui uma base funcional importante. Pelas telas atuais, existem quatro áreas principais:

1. `Parceiros`
2. `Melhor Envio`
3. `Loja / Remetente`
4. `Caixas Salvas`

Também já existem transportadoras manuais, cadastro de parceiro logístico, prazo médio, status, endereço de coleta, dados do remetente, integração automática com Melhor Envio, embalagens salvas, embalagem padrão e refresh.

A missão é transformar essa base em uma verdadeira **Central de Logística & Envios**, preservando as regras atuais e elevando UI, UX, arquitetura, confiabilidade e capacidade operacional.

---

# 1. Objetivo do módulo

O usuário deve conseguir responder rapidamente:

- quais métodos de entrega estão ativos;
- quais são manuais e quais são automáticos;
- se o Melhor Envio está conectado e saudável;
- se o remetente está corretamente configurado;
- se existe embalagem padrão válida;
- quais regiões cada parceiro manual atende;
- quais regras de preço e prazo estão sendo aplicadas;
- qual método aparece no checkout;
- se existe fallback quando uma cotação falha;
- se há produtos sem peso/dimensões;
- se há erros de integração, cotação, etiqueta ou rastreamento.

O objetivo não é apenas cadastrar transportadoras. O módulo deve ser a camada de **configuração logística do checkout, expedição e pós-venda**.

---

# 2. Regra obrigatória antes de alterar código

Antes de modificar qualquer arquivo:

1. Ler `@AdminCarriers.jsx`, `@MASTER_ADMIN_UI_UX_REFACTOR.md` e `@ui-ux-guidelines.md`.
2. Localizar e analisar componentes filhos, hooks, services, schemas, stores/contextos, APIs, endpoints de frete, Melhor Envio, checkout, pedidos, remetente, embalagens, regras de despacho, autenticação, webhooks, etiquetas, rastreamento e permissões.
3. Mapear claramente:
   - funcionalidades existentes;
   - regras de negócio;
   - contratos de API;
   - validações;
   - campos persistidos;
   - dependências com checkout/pedidos;
   - itens implementáveis somente no front;
   - itens dependentes de backend.
4. Não remover comportamento porque ele não aparece nas screenshots.
5. Apresentar um plano curto e então executar.

---

# 3. Direção de UI/UX

O módulo atual é limpo, mas ainda muito configuracional. A refatoração deve torná-lo mais operacional.

Melhorar:

- densidade das telas;
- hierarquia entre configuração, status e ação;
- feedback de integração;
- feedback ao salvar;
- tratamento de erro;
- estados vazios;
- legibilidade de tabelas;
- uso do espaço;
- proteção contra perda de alterações;
- capacidade de testar uma configuração antes de impactar o checkout.

Evitar:

- grandes áreas vazias;
- cards gigantes para poucos campos;
- excesso de cor;
- formulários muito largos;
- repetir o mesmo padrão visual em blocos independentes;
- esconder problemas de integração atrás de um badge genérico.

---

# 4. Navegação principal

Preservar o padrão aprovado de **menu afundado / recessed navigation**.

Estrutura atual:

```text
Parceiros | Melhor Envio | Loja / Remetente | Caixas Salvas
```

Essa estrutura pode ser mantida.

Renomear `Caixas Salvas` para `Embalagens` apenas se o conceito evoluir para outros tipos de pacote além de caixa.

Opcionalmente, se houver funcionalidade real suficiente no backend, adicionar futuramente:

`Regras de Frete`

Não criar uma aba nova apenas para preencher espaço.

---

# 5. Header do módulo

Padronizar:

```text
Logística & Envios
Configure transportadoras, integração de frete, remetente e embalagens.

                           Atualizado há 1 min   [↻]
```

A ação principal deve variar conforme a aba.

### Parceiros

`+ Nova Transportadora`

### Embalagens

`+ Nova Embalagem`

### Loja / Remetente

`Salvar alterações` somente quando houver mudança.

### Melhor Envio

`Configurar`, `Reconectar` ou `Testar integração`, conforme o estado real.

O refresh deve possuir loading, timestamp, erro e prevenção de cliques repetidos.

---

# 6. Resumo de saúde logística

Adicionar, sem necessariamente criar uma nova aba, um resumo compacto quando houver dados:

```text
Transportadoras ativas   4
Melhor Envio              Conectado
Remetente                 Completo
Embalagem padrão          Box M
```

Alertas possíveis:

```text
! Melhor Envio precisa ser reconectado
! Nenhuma embalagem padrão definida
! CEP do remetente inválido
! 14 produtos sem dimensões
```

Todos os sinais devem derivar de regras reais. Não criar score arbitrário.

---

# 7. Parceiros — transportadoras manuais

A área `Cotação Própria` deve evoluir de uma lista simples para um gerenciamento de métodos manuais.

Na tabela, mostrar quando os dados existirem:

- logo;
- nome;
- tipo `Manual`;
- cobertura;
- prazo;
- regra de preço;
- status;
- prioridade;
- última alteração;
- ações.

Exemplo:

```text
Transportadora XYZ
Manual
Cobertura: MG, SP, RJ
Prazo: 2–4 dias úteis
Preço: tabela própria
Status: Ativa
```

---

# 8. Cadastro de parceiro manual

Preservar os campos existentes e reorganizar o fluxo.

## Identificação

- nome interno;
- nome exibido no checkout, se necessário;
- logo;
- código interno opcional;
- status;
- descrição curta.

## Prazo

Separar, quando suportado:

- prazo de preparação/manuseio;
- prazo de transporte;
- prazo total mostrado ao cliente.

Exemplo:

```text
Preparação    1 dia
Transporte    2–4 dias
Checkout      3–5 dias úteis
```

---

# 9. Cobertura de parceiros manuais

Incremento P1 importante.

Preparar regras de cobertura por:

- todo Brasil;
- UF;
- cidade;
- faixa de CEP;
- CEP específico;
- região personalizada.

Permitir inclusão e exclusão somente se o backend suportar.

Exemplo:

```text
Atende:
[x] Minas Gerais
[x] São Paulo
[x] Rio de Janeiro

Excluir faixas:
01000-000 até 01999-999
```

Grandes regras devem ser persistidas no backend, e não processadas somente no client.

---

# 10. Regras de preço manual

Hoje um prazo médio isolado não é suficiente para uma operação manual real.

Preparar suporte a modelos como:

### Preço fixo

`R$ 19,90`

### Faixa por peso

```text
0–1 kg       R$ 15,90
1–5 kg       R$ 22,90
5–10 kg      R$ 34,90
```

### Faixa por valor do pedido

```text
até R$ 100          R$ 20,00
R$ 100–300          R$ 12,00
acima de R$ 300     grátis
```

### Por região

```text
Capital             R$ 14,90
Interior            R$ 24,90
```

Não implementar todos os modelos se o backend ainda não os suporta. Preparar a arquitetura e documentar dependências.

---

# 11. Regras de checkout

Preparar uma camada clara entre configuração logística e exibição no checkout.

Campos/regras possíveis:

- nome exibido;
- prioridade;
- mínimo/máximo do pedido;
- peso mínimo/máximo;
- regiões;
- categorias/produtos;
- valor do frete;
- prazo adicional;
- frete grátis;
- ordem de exibição.

Adicionar preview quando houver suporte:

```text
Como aparece no checkout

Entrega Econômica
Chega em 5–7 dias úteis
R$ 18,90
```

---

# 12. Frete grátis

P1 recomendado.

Preparar regras por:

- valor mínimo;
- região;
- categoria;
- produto;
- coleção;
- campanha;
- cupom;
- primeira compra;
- período.

Toda regra promocional deve ter status, prioridade e vigência quando aplicável.

Se promoções de frete já pertencem a outro módulo, reutilizar e não duplicar.

---

# 13. Sobretaxa e desconto logístico

Preparar suporte a:

- valor adicional fixo;
- percentual adicional;
- desconto;
- prazo adicional.

Útil para:

- embalagem;
- manuseio;
- área remota;
- operação própria.

Nunca recalcular no front valores que devem vir do provider ou backend.

---

# 14. Prioridade e fallback

P1 recomendado.

Quando múltiplos serviços retornarem, o sistema deve conseguir definir estratégia:

- menor preço;
- menor prazo;
- prioridade manual;
- regra personalizada.

Preparar fallback:

```text
Se Melhor Envio falhar:
1. Transportadora manual válida
2. Retirada local, se disponível
3. Não oferecer frete
```

Não aplicar fallback silencioso que altere preço ou prazo sem regra explícita.

---

# 15. Melhor Envio — visão da integração

A aba automática deve comunicar saúde, não apenas configuração.

Exemplo:

```text
Melhor Envio

Status           Conectado
Ambiente          Produção
Conta             usuario@...
Última cotação    há 2 min
Último webhook    há 14 s

[Simular cotação] [Reconectar]
```

Estados:

- Não configurado;
- Conectando;
- Conectado;
- Requer atenção;
- Token expirado;
- Erro;
- Sandbox/Teste.

---

# 16. Segurança de autenticação

Auditar a implementação OAuth/tokens.

Tokens e secrets:

- não devem ficar expostos no client;
- não devem ser persistidos em localStorage;
- não devem aparecer em logs;
- não devem ser retornados integralmente sem necessidade;
- devem ser tratados no backend.

Se a implementação atual não atende isso, registrar como risco crítico.

---

# 17. Simulador de cotação

Incremento P1 de alto valor.

Adicionar `Simular cotação` sem criar pedido ou etiqueta.

Campos:

```text
CEP origem
CEP destino
Peso
Altura
Largura
Comprimento
Valor declarado
```

Opcional:

- embalagem salva;
- produto de exemplo;
- seguro;
- serviços adicionais.

Resultado:

```text
Correios PAC
R$ 23,90
5 dias úteis

Jadlog
R$ 21,50
4 dias úteis
```

Mostrar erros retornados pela integração de forma segura e acionável.

---

# 18. Estratégia de empacotamento

O sistema deve saber claramente qual estratégia utiliza.

## A — Provider calcula pacotes

Enviar produtos/dimensões e permitir que o Melhor Envio faça o empacotamento.

## B — HUB calcula volumes

Usar as embalagens salvas e enviar os volumes já definidos.

Não misturar as duas estratégias de forma imprevisível.

Documentar no código qual é a fonte de verdade.

---

# 19. Embalagem padrão

Preservar o comportamento existente.

Se houver somente uma embalagem padrão, ao trocar:

```text
Tornar "Box M" a embalagem padrão?

"Box P" deixará de ser a embalagem padrão.

[Cancelar] [Definir como padrão]
```

Não permitir estado inconsistente com duas embalagens padrão se a regra é única.

---

# 20. Cadastro de embalagens

Manter:

- nome;
- altura;
- largura;
- comprimento;
- peso vazio/tara;
- embalagem padrão.

Adicionar quando fizer sentido:

- tipo;
- status;
- descrição;
- capacidade/peso máximo;
- código interno;
- custo da embalagem;
- estoque da embalagem.

Tipos possíveis:

- Caixa;
- Envelope;
- Pacote;
- Tubo/Rolo;
- Personalizado.

Só mostrar tipos realmente suportados pelo fluxo de cotação/expedição.

---

# 21. Peso físico, volumétrico e tarifável

A UI deve conseguir mostrar a diferença quando houver cálculo disponível:

```text
Peso físico       2,4 kg
Peso volumétrico  3,1 kg
Peso tarifável    3,1 kg
```

Não hardcodar um divisor cúbico universal.

Cada transportadora/serviço pode possuir regra distinta.

Para Correios, o cálculo volumétrico vigente deve pertencer à integração/regra do serviço, não ser uma constante espalhada pelo JSX.

---

# 22. Validação das dimensões

Não usar placeholders como única indicação de limites.

Quando houver mínimo/máximo do provider:

```text
Mínimo para este serviço: 11 cm
```

ou erro contextual.

Não tratar limites de Correios como limites universais.

As regras devem vir do provider/configuração versionada.

---

# 23. Loja / Remetente

Preservar:

- nome/razão social;
- CPF/CNPJ;
- e-mail;
- telefone;
- CEP;
- rua;
- número;
- bairro;
- cidade;
- UF.

Melhorar:

- máscara de documento;
- CPF/CNPJ conforme tipo;
- máscara de CEP;
- consulta automática de CEP;
- loading da consulta;
- mensagem CEP não encontrado;
- endereço editável após preenchimento;
- validação de telefone;
- validação de e-mail.

---

# 24. Pessoa física x jurídica

Se o backend já comportar ou puder evoluir, separar:

```text
Tipo de remetente
( ) Pessoa Física
( ) Pessoa Jurídica
```

Pessoa Física:

- CPF.

Pessoa Jurídica:

- CNPJ;
- Razão Social;
- Inscrição Estadual quando necessária;
- CNAE quando exigido por algum serviço.

Não exigir campos que o fluxo não usa.

---

# 25. Origens de envio múltiplas

P2.

Preparar arquitetura para futuramente trabalhar com:

- matriz;
- centro de distribuição;
- loja física;
- fornecedor/dropshipping.

Cada origem pode possuir:

- nome;
- endereço;
- contato;
- documento;
- status;
- estoque vinculado;
- embalagem padrão.

Não implementar multi-origin parcialmente se checkout, estoque e pedidos ainda assumem uma única origem.

---

# 26. Agências/pontos de postagem

Determinados serviços podem exigir seleção de agência.

Preparar UI contextual para:

- transportadora;
- agência;
- UF;
- cidade;
- endereço;
- favorita.

Mostrar somente quando necessário ao serviço.

---

# 27. Serviços adicionais

Quando suportados pelo provider:

- seguro/valor declarado;
- aviso de recebimento;
- mão própria;
- outros serviços disponíveis.

Não assumir que todos os serviços suportam as mesmas opções.

---

# 28. Seguro / valor declarado

Preparar política configurável, conforme backend/provider:

```text
Seguro
( ) Quando obrigatório
( ) Sempre
( ) Nunca, quando permitido
```

O cálculo final pertence ao backend/provider.

---

# 29. Dados fiscais do envio

Uma remessa pode depender de:

- chave da NF-e;
- declaração de conteúdo;
- tipo comercial/não comercial;
- XML/documento em serviços específicos.

Não armazenar esses dados do pedido dentro da configuração global da transportadora.

`AdminCarriers` define capacidades/defaults; o módulo de pedidos/expedição fornece os dados daquela remessa.

---

# 30. Fluxo completo do Melhor Envio

Auditar se o projeto cobre apenas cotação ou todo o fluxo:

```text
Autenticação
↓
Cotação
↓
Seleção do serviço
↓
Inserção no carrinho
↓
Compra/pagamento
↓
Geração da etiqueta
↓
Impressão
↓
Postagem
↓
Rastreamento
↓
Entrega
```

`AdminCarriers` deve configurar e diagnosticar a integração.

A operação diária de etiquetas e expedição deve permanecer no módulo de pedidos/fulfillment, se já existir ou for criado.

---

# 31. Etiquetas

Se o projeto já gera etiquetas, revisar UX de:

- geração;
- processamento assíncrono;
- impressão;
- reimpressão;
- erro;
- cancelamento.

Não presumir que a etiqueta fica imprimível instantaneamente após solicitar geração.

---

# 32. Rastreamento

P1 importante para o ecossistema logístico.

Mapear estados externos para estados canônicos do HUB, por exemplo:

- criado;
- aguardando;
- etiqueta gerada;
- postado;
- em trânsito;
- saiu para entrega;
- entregue;
- não entregue;
- pausado;
- cancelado.

Usar o status real do provider como fonte e manter detalhes técnicos disponíveis quando necessário.

---

# 33. Webhooks

Auditar se o Melhor Envio está sendo acompanhado por webhook.

Quando existir:

- validar assinatura no backend;
- tornar handler idempotente;
- registrar recebimento;
- não processar evento duplicado duas vezes;
- guardar logs técnicos sem dados sensíveis;
- tratar retry quando apropriado.

No Admin, mostrar quando houver dados:

```text
Webhook        Operacional
Último evento  há 32 s
```

---

# 34. Diagnóstico da integração

Criar ou preparar um painel compacto:

```text
Saúde do Melhor Envio

Autenticação       OK
Cotação            OK
Webhook            OK
Última cotação     18:43
Último webhook     18:44
```

Ações:

- Testar cotação;
- Reconectar;
- Ver último erro.

Não expor tokens nem PII.

---

# 35. Produtos com dados logísticos incompletos

Integrar com o catálogo quando houver dados:

```text
14 produtos sem peso
8 produtos sem dimensões
```

Ação:

`Revisar produtos`

Não inventar peso/dimensão automaticamente.

---

# 36. Readiness logístico

Criar um checklist objetivo:

```text
✓ Remetente configurado
✓ CEP válido
✓ Melhor Envio conectado
✓ Embalagem padrão definida
! 14 produtos sem dimensões
✓ Pelo menos 1 método ativo
```

Usar apenas regras verificáveis.

---

# 37. Desempenho de transportadoras

P2, se houver histórico de pedidos e tracking.

Métricas possíveis:

- custo médio;
- prazo prometido x realizado;
- entregas no prazo;
- atraso;
- taxa de falha;
- regiões problemáticas.

Separar tempo interno de preparação do tempo de trânsito da transportadora.

---

# 38. SLA operacional

Quando houver dados:

```text
Pedido criado
↓ Separação
Pronto para postagem
↓ Postagem
Em trânsito
↓
Entregue
```

Medir:

- tempo de separação;
- tempo até postagem;
- trânsito;
- entrega final.

Isso evita atribuir todo atraso à transportadora.

---

# 39. Logística reversa

P2 recomendado.

Preparar integração com pedidos/devoluções:

```text
Solicitar devolução
↓
Selecionar serviço
↓
Gerar autorização/etiqueta
↓
Acompanhar retorno
```

Não colocar toda a operação dentro de `AdminCarriers`.

Aqui pode apenas indicar capacidade/configuração.

---

# 40. Retirada local

Se existir loja física, tratar como método logístico próprio:

- unidade;
- endereço;
- prazo de preparação;
- instruções;
- horário;
- gratuito/pago.

Não misturar retirada com transportadora externa.

---

# 41. Entrega local

Para operação própria, preparar:

- CEP;
- cidade;
- bairro;
- região;
- valor;
- prazo.

Cálculo por raio só deve existir se houver infraestrutura de geocoding/mapas adequada.

---

# 42. Cutoff, feriados e blackout

P2.

Preparar regras como:

```text
Pedidos até 14:00: despacho no mesmo dia
Após 14:00: próximo dia útil
```

Considerar futuramente:

- fins de semana;
- feriados;
- dias sem expedição;
- recesso;
- origem.

Só prometer SLA que a operação consegue cumprir.

---

# 43. Salvamento

Padronizar conforme master:

```text
Salvar
↓
Salvando...
↓
✓ Salvo
```

Salvar não deve:

- fechar;
- limpar o formulário;
- mudar de aba;
- perder scroll.

Adicionar toast e indicador de `Alterações não salvas`.

Ao sair com alterações:

```text
Descartar alterações?

Existem alterações que ainda não foram salvas.

[Continuar editando] [Descartar e sair]
```

---

# 44. Exclusão

Transportadora/embalagem deve ter confirmação com impacto real.

Exemplo:

```text
Excluir transportadora?

Ela deixará de ficar disponível para novas cotações.
Pedidos já criados não serão alterados.

[Cancelar] [Excluir transportadora]
```

A mensagem deve refletir o comportamento verdadeiro.

---

# 45. Status padronizados

Transportadora:

- Ativa;
- Inativa;
- Rascunho;
- Requer atenção.

Integração:

- Conectada;
- Não configurada;
- Requer atenção;
- Erro.

Embalagem:

- Ativa;
- Inativa;
- Padrão.

Não depender somente de cor.

---

# 46. Estados vazios

Parceiros:

```text
Nenhuma transportadora manual cadastrada

Use parceiros manuais quando precisar oferecer uma opção
que não vem de uma integração automática.

[+ Nova Transportadora]
```

Embalagens:

```text
Nenhuma embalagem salva

Cadastre os pacotes usados na operação para agilizar
cálculos e expedições.

[+ Nova Embalagem]
```

---

# 47. Busca e filtros

Adicionar somente quando o volume justificar.

Parceiros:

- busca;
- status;
- cobertura;
- tipo.

Embalagens:

- busca;
- tipo;
- status;
- padrão.

Não criar uma toolbar complexa para uma lista com poucos registros.

---

# 48. Auditoria

Quando o backend suportar, registrar:

- transportadora criada/editada;
- ativação/desativação;
- exclusão;
- conexão/reconexão;
- remetente alterado;
- embalagem alterada;
- padrão trocado;
- regra de frete alterada.

Guardar ator, timestamp e diff quando possível.

Nunca registrar token/secret.

---

# 49. Arquitetura de providers

Evitar condicionais espalhadas.

Preparar uma camada como:

```text
shippingProviders/
  manual/
  melhor-envio/
  future-provider/
```

Cada provider pode declarar:

- id;
- nome;
- tipo;
- capabilities;
- cotação;
- etiqueta;
- tracking;
- webhook;
- autenticação;
- serviços adicionais;
- múltiplos volumes;
- logística reversa.

Adaptar ao padrão real do projeto e não abstrair prematuramente.

---

# 50. Futuras integrações

Preparar arquitetura, sem implementar sem demanda, para:

- Correios direto;
- contratos próprios com transportadoras;
- outros hubs de frete;
- operadores last mile;
- retirada local;
- entrega própria.

A interface não deve assumir que Melhor Envio será o único provider automático para sempre.

---

# 51. Responsividade

Desktop:

- tabelas densas;
- formulários em grid;
- ações alinhadas.

Tablet:

- reduzir colunas;
- reorganizar toolbar.

Mobile:

- tabs com scroll horizontal;
- formulários em uma coluna;
- tabelas com scroll ou cards somente quando não houver perda de comparação;
- SaveButton acessível;
- dialogs/drawers adaptados.

---

# 52. Acessibilidade

Aplicar `@MASTER_ADMIN_UI_UX_REFACTOR.md`.

Especial atenção a:

- tabs;
- inputs;
- upload de logo;
- switches;
- botões somente com ícone;
- status;
- mensagens de CEP;
- dialogs de exclusão.

Editar/excluir precisam de nome acessível.

---

# 53. Loading e erros

Tratar:

- loading inicial;
- refresh;
- busca de CEP;
- salvamento;
- integração;
- cotação;
- timeout;
- erro do provider.

Não reduzir todos os erros a `Erro ao calcular frete`.

Exibir mensagem segura e acionável e manter detalhes técnicos em logs/diagnóstico.

---

# 54. Performance

Revisar:

- requests duplicados;
- consulta de CEP repetida;
- refresh desnecessário;
- chamadas de cotação redundantes;
- loops de polling;
- re-renders;
- fetch de serviços.

Não implementar cache de preço/prazo sem entender validade e regra do provider.

---

# 55. Estrutura sugerida

Adaptar às convenções existentes:

```text
AdminCarriers/
  AdminCarriersPage.jsx

  partners/
    PartnersTab.jsx
    PartnersTable.jsx
    CarrierEditor.jsx
    CoverageRules.jsx
    PricingRules.jsx
    DeliveryPromise.jsx

  melhor-envio/
    MelhorEnvioTab.jsx
    IntegrationStatus.jsx
    QuoteSimulator.jsx
    ConnectionDiagnostics.jsx

  sender/
    SenderTab.jsx
    SenderForm.jsx
    AddressForm.jsx

  packages/
    PackagesTab.jsx
    PackagesTable.jsx
    PackageEditor.jsx

  rules/
    ShippingRules.jsx
    FreeShippingRules.jsx
    FallbackRules.jsx

  shared/
    RecessedTabs.jsx
    RefreshButton.jsx
    SaveButton.jsx
    StatusBadge.jsx
    EmptyState.jsx
    UnsavedChangesGuard.jsx

  providers/
    registry.js

  hooks/
  schemas/
  services/
  utils/
  constants/
```

Não criar essa árvore cegamente.

---

# 56. Prioridades

## P0 — obrigatório

- refatoração visual;
- menu afundado preservado;
- header consistente;
- refresh com feedback;
- Parceiros reorganizado;
- cadastro manual mais compacto;
- Remetente refinado;
- Embalagens refinadas;
- SaveButton padronizado;
- alterações não salvas;
- loading/error/empty;
- status claros;
- responsividade;
- acessibilidade;
- revisão da integração Melhor Envio;
- zero regressão no checkout/cotação.

## P1 — alta prioridade

- simulador de cotação;
- saúde da integração;
- cobertura manual;
- preço/prazo manual estruturado;
- regras de frete;
- fallback;
- frete grátis;
- agências;
- serviços adicionais;
- peso físico/volumétrico;
- alertas de produtos incompletos;
- webhook/rastreamento;
- cutoff.

## P2 — evolução

- multi-origin;
- retirada local;
- entrega local;
- logística reversa;
- desempenho por transportadora;
- SLA;
- janelas de entrega;
- feriados/blackout;
- estoque/custo de embalagens;
- regras avançadas por produto/categoria.

---

# 57. Pontos específicos do Melhor Envio

Ao revisar a integração:

1. manter autenticação segura;
2. não expor token/secret no client;
3. diferenciar sandbox e produção;
4. tratar cotação por produtos versus volumes de forma explícita;
5. preservar os dados relevantes da cotação usados nas etapas seguintes;
6. não assumir suporte uniforme a múltiplos volumes;
7. tratar geração de etiqueta como potencialmente assíncrona;
8. tratar status por consulta e/ou webhook;
9. validar assinatura de webhook no backend;
10. usar IDs de serviço/provider, evitando comparação frágil por nome;
11. tratar serviços adicionais conforme disponibilidade;
12. preparar tracking;
13. preparar logística reversa somente onde suportada;
14. não duplicar o fluxo operacional de pedidos dentro do Admin.

---

# 58. Critérios de aceite

A refatoração estará pronta quando:

- regras atuais continuarem funcionando;
- menu afundado estiver refinado;
- Parceiros estiver consistente;
- Melhor Envio possuir status claro;
- Remetente estiver validado;
- Embalagens estiverem organizadas;
- refresh tiver estado/timestamp;
- salvar não fechar a tela;
- alterações não salvas estiverem protegidas;
- exclusão possuir confirmação;
- loading/empty/error/success existirem;
- formulários forem responsivos;
- acessibilidade básica tiver sido validada;
- checkout/cotação não tiver regressão;
- dependências de backend estiverem documentadas.

---

# 59. Entrega final esperada

Ao concluir, informar resumidamente:

1. arquitetura encontrada;
2. regras de negócio preservadas;
3. arquivos alterados/criados;
4. componentes compartilhados criados;
5. melhorias de UI/UX;
6. melhorias logísticas;
7. integração Melhor Envio revisada;
8. funcionalidades novas implementadas;
9. itens dependentes de backend;
10. testes realizados;
11. riscos/pendências.

Não entregar apenas mock ou recomendações.

---

# 60. Comando final

Refatore completamente `@AdminCarriers.jsx` seguindo integralmente:

- `@ADMIN_CARRIERS_REFACTOR.md`
- `@MASTER_ADMIN_UI_UX_REFACTOR.md`
- `@ui-ux-guidelines.md`

Antes de alterar, audite o módulo e todas as dependências relacionadas a cotação, checkout, Melhor Envio, remetente, parceiros e embalagens.

Preserve APIs, integrações e regras de negócio existentes.

Implemente a refatoração progressivamente no código real.

Para funcionalidades ainda não suportadas pelo backend, prepare a arquitetura somente quando trouxer benefício concreto, documente a dependência e não simule funcionamento de produção.
