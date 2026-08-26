# ADMIN_PRODUCTS_REFACTOR.md

## Contexto

Refatorar completamente o módulo **`@AdminProducts.jsx`** e o fluxo de **criação/edição de produto**, usando obrigatoriamente:

- `@ui-ux-guidelines.md`
- `@MASTER_ADMIN_UI_UX_REFACTOR.md`
- código atual do módulo e todos os arquivos relacionados

As imagens atuais devem ser usadas como referência funcional do que existe hoje, mas **não como restrição de layout**.

O único elemento visual que deve ser preservado conceitualmente é o **menu afundado/recessed segmented navigation**, redesenhado de forma consistente.

---

# 1. Missão

Transformar o módulo de produtos em um **centro de gestão de catálogo de e-commerce profissional**, cobrindo:

- catálogo;
- produto;
- preços;
- estoque;
- variações;
- mídia;
- fiscal;
- logística;
- SEO;
- canais;
- métricas;
- filtros;
- auditoria;
- saúde do catálogo;
- produtividade operacional.

A solução precisa parecer pronta para um e-commerce real com centenas ou milhares de SKUs.

---

# 2. Regra mais importante: não começar codando

Antes de alterar qualquer componente:

1. Auditar `AdminProducts.jsx`.
2. Identificar os componentes de:
   - dashboard;
   - produtos;
   - auditoria;
   - criação/edição;
   - catálogo de métricas;
   - filtro de período;
   - refresh.
3. Mapear APIs, hooks, stores, schemas, permissões e regras de negócio.
4. Mapear quais dados já existem no backend e quais sugestões deste documento exigem backend.
5. Separar claramente:
   - `já suportado`;
   - `pode ser implementado apenas no front`;
   - `depende de backend`;
   - `incremento futuro`.
6. Apresentar um plano curto e então executar a refatoração.

Não inventar dados em produção para preencher cards.

---

# 3. Problemas visuais a resolver

A interface atual apresenta uma base funcional, porém precisa ser reestruturada para:

- reduzir espaços vazios excessivos;
- reduzir títulos desproporcionalmente grandes;
- unificar alturas de controles;
- padronizar cards;
- remover excesso de cores decorativas;
- tornar filtros mais completos;
- tornar dashboards mais informativos;
- melhorar os estados vazios;
- melhorar feedback ao salvar;
- dar contexto para refresh;
- tornar ações primárias mais evidentes;
- tornar o editor de produto mais seguro para longas sessões de trabalho;
- dar visibilidade de completude e erros do cadastro.

---

# 4. Arquitetura principal do módulo

Manter três áreas principais:

1. **Dashboard**
2. **Produtos**
3. **Auditoria**

Usar o menu afundado como navegação principal local.

## Header do módulo

Proposta:

```text
[ícone] Gestão de Catálogo
Gerencie produtos, estoque, preços, fiscal, canais e desempenho.

                                     [Atualizado há 2 min] [↻] [Catálogo de Métricas]
```

Na aba Produtos adicionar ação:

`+ Novo Produto`

O botão de refresh deve:

- mostrar loading;
- impedir cliques repetidos durante atualização;
- atualizar timestamp;
- exibir erro se a atualização falhar.

---

# 5. Novo filtro de período

O filtro atual com data inicial e final é uma boa direção e deve virar o padrão do módulo.

## Popover de período

Cabeçalho:

`Filtrar período`

Presets:

- Hoje
- Ontem
- Últimos 7 dias
- Últimos 30 dias
- Este mês
- Mês anterior
- Este trimestre
- Este ano
- Personalizado

Modo personalizado:

- Data inicial
- Data final
- calendário
- validação
- Limpar
- Aplicar filtro

Adicionar opção:

`Comparar com`

- sem comparação;
- período anterior;
- mesmo período do ano anterior;
- personalizado.

O período deve afetar somente métricas que façam sentido temporal.

---

# 6. Barra de filtros avançados do catálogo

Na aba Produtos criar uma barra compacta, com filtros primários visíveis e filtros avançados em popover/drawer.

## Busca global

Placeholder sugerido:

`Buscar por produto, SKU, GTIN/EAN ou ID...`

## Filtros recomendados

- período de criação;
- período de atualização;
- categoria;
- subcategoria;
- marca;
- fornecedor;
- origem/provedor da integração;
- status: rascunho, ativo, inativo, arquivado;
- publicação;
- canal de venda;
- estoque:
  - em estoque;
  - baixo;
  - zerado;
  - estoque infinito;
  - por encomenda;
- faixa de preço;
- faixa de margem;
- possui variação;
- possui imagem;
- possui vídeo;
- situação fiscal:
  - completo;
  - incompleto;
  - revisar;
- situação SEO:
  - completo;
  - incompleto;
- GTIN:
  - preenchido;
  - ausente;
  - inválido;
- fornecedor;
- tags;
- coleção;
- data da última venda, quando disponível.

## UX dos filtros

- mostrar chips de filtros ativos;
- badge com quantidade de filtros;
- `Limpar tudo`;
- manter filtros ao navegar para um produto e voltar;
- sincronizar filtros na URL quando possível;
- permitir salvar visualizações.

Visualizações sugeridas:

- Todos os produtos
- Ativos
- Estoque baixo
- Esgotados
- Sem imagem
- Sem GTIN
- Fiscal incompleto
- SEO incompleto
- Rascunhos
- Atualizados recentemente

---

# 7. Aba Dashboard

Substituir o dashboard vazio por um painel operacional.

## KPIs executivos

Priorizar dados realmente úteis:

- Receita bruta atribuída
- Receita líquida
- Pedidos
- Unidades vendidas
- Ticket médio
- Margem bruta
- Produtos ativos
- Produtos esgotados

Cada KPI deve permitir comparação com período anterior.

## Saúde operacional do catálogo

Criar bloco:

`Saúde do Catálogo`

Indicadores:

- produtos sem imagem;
- produtos sem categoria;
- produtos sem GTIN;
- produtos com fiscal incompleto;
- produtos com SEO incompleto;
- produtos com estoque baixo;
- produtos sem custo;
- produtos sem peso/dimensões;
- variantes com inconsistência.

Criar um score opcional de completude:

`92% do catálogo completo`

O score deve ser baseado em regras transparentes, não em número arbitrário.

## Estoque

Adicionar quando houver dados:

- valor total em estoque;
- estoque baixo;
- itens esgotados;
- estoque parado;
- sell-through;
- giro de estoque;
- dias estimados de cobertura;
- produtos com maior risco de ruptura.

## Comercial

Adicionar:

- Top produtos por receita;
- Top por unidades;
- produtos com maior crescimento;
- produtos com queda relevante;
- margem por produto/categoria;
- vendas por categoria;
- descontos/promos no período.

## Tendência

Adicionar pelo menos uma visualização temporal quando houver dados:

- receita;
- unidades vendidas;
- pedidos.

Permitir alternar dimensão sem criar vários gráficos repetidos.

---

# 8. Catálogo de Métricas

Manter o conceito já existente do botão **Catálogo** e do modal/drawer **Catálogo de Métricas**, mas evoluí-lo.

## Lista lateral

Adicionar:

- campo de busca;
- categorias;
- favoritos;
- métricas fixadas no dashboard.

Categorias sugeridas:

- KPIs Executivos
- Receita & Margem
- Funil & Conversão
- Produto
- Estoque
- Clientes
- Logística
- Devoluções
- Qualidade do Catálogo

## Detalhe da métrica

Exibir:

- nome;
- descrição;
- fórmula;
- unidade;
- fonte de dados;
- frequência de atualização;
- quais filtros afetam a métrica;
- dimensões disponíveis;
- observações;
- ação `Adicionar ao Dashboard`, se suportado.

Exemplo:

```text
Ticket Médio (AOV)

Receita atribuída dividida pela quantidade de pedidos.

Fórmula:
Receita Bruta ÷ Pedidos

Unidade:
R$

Atualização:
quase em tempo real

Filtros:
período, canal, categoria, produto
```

---

# 9. Aba Produtos

## Toolbar

Estrutura sugerida:

```text
[Buscar produto, SKU ou GTIN........] [Filtros 3]
[Categoria] [Status] [Estoque]                  [+ Novo Produto]
```

Filtros ativos ficam logo abaixo.

## Tabela

Colunas padrão:

- Produto
- SKU principal
- Categoria
- Preço
- Estoque disponível
- Status
- Saúde do cadastro
- Atualizado em
- Ações

Permitir configurar colunas.

## Linha de produto

Mostrar:

- thumbnail;
- nome;
- SKU;
- quantidade de variantes;
- badges discretos;
- alerta fiscal/SEO quando necessário.

## Ações em massa

Quando houver seleção:

- ativar;
- desativar;
- arquivar;
- alterar categoria;
- alterar tags;
- exportar;
- atualizar estoque/preço quando suportado.

Ações destrutivas devem pedir confirmação.

## Ações individuais

Menu de contexto:

- Editar
- Duplicar
- Visualizar
- Abrir na loja
- Arquivar
- Histórico/Auditoria

---

# 10. Novo fluxo de criação e edição de produto

## Header do editor

Trocar o padrão atual por um header operacional mais compacto.

Exemplo:

```text
← Voltar ao catálogo

Novo Produto
Rascunho • Alterações não salvas

                         [Pré-visualizar] [•••] [Salvar produto]
```

Depois do primeiro salvamento:

```text
Produto ABC
Ativo • Salvo há 10 s

                         [Pré-visualizar] [•••] [Salvar alterações]
```

## Regra obrigatória de salvamento

**Salvar nunca deve fechar automaticamente a criação/edição.**

Ao salvar:

1. manter o usuário na mesma tela;
2. manter a aba atual;
3. preservar scroll quando possível;
4. exibir `Salvando...`;
5. depois `Salvo`;
6. mostrar toast `Produto salvo com sucesso`;
7. atualizar ID/slug/status se o backend retornar esses valores.

Adicionar no menu de ações, quando fizer sentido:

- Salvar e sair
- Salvar como rascunho
- Duplicar
- Arquivar

Não transformar `Salvar e sair` na ação principal.

---

# 11. Voltar / Cancelar

Evitar um botão `Cancelar` solto no topo como se fosse uma ação de formulário simples.

Preferir:

`← Voltar ao catálogo`

Comportamento:

- se nada mudou: voltar imediatamente;
- se houver alterações não salvas: abrir confirmação.

Modal:

```text
Descartar alterações?

Existem alterações que ainda não foram salvas.

[Continuar editando] [Descartar e sair]
```

Se o produto já tiver sido salvo, `Voltar ao catálogo` não deve apagar nada.

---

# 12. Navegação interna do editor

Preservar o conceito de menu afundado.

Sugestão de abas:

1. Geral
2. Ficha Técnica
3. Estoque
4. Mídia
5. Variações
6. Fiscal
7. Logística
8. SEO & Canais

`Extras` genérico deve ser evitado; nomear a função real.

Adicionar opcionalmente pequenos indicadores:

- ponto de erro;
- check de seção completa;
- quantidade de pendências.

Não usar uma cor diferente em cada aba.

---

# 13. Aba Geral

## Informações básicas

Campos recomendados:

- nome;
- SKU mestre;
- status;
- marca;
- fornecedor;
- categoria;
- subcategoria;
- tipo de produto;
- coleções;
- tags.

## Preço

Separar claramente:

- preço de venda;
- preço promocional;
- custo;
- preço comparativo/de;
- margem estimada;
- início/fim da promoção quando suportado.

Calcular margem apenas se custo existir.

## Descrição

Usar editor adequado à necessidade atual.

Se houver rich text, preservar sanitização e segurança.

Adicionar contador/qualidade apenas se for útil, não gamificação vazia.

---

# 14. Ficha Técnica

Manter pares `Atributo / Valor`, mas melhorar.

Recursos:

- adicionar;
- excluir;
- reordenar;
- autocomplete com atributos recorrentes;
- templates por categoria;
- unidades padronizadas;
- impedir duplicatas idênticas;
- edição por teclado.

Exemplos:

- Material
- Cor
- Voltagem
- Capacidade
- Modelo
- Fabricante

Se a categoria possuir atributos estruturados, preferir campos específicos a texto livre.

---

# 15. Estoque

Evoluir `Gestão de Inventário`.

## Conceitos separados

- estoque físico;
- reservado;
- disponível;
- em trânsito;
- segurança;
- ponto de reposição.

Fórmula conceitual:

`Disponível = Físico - Reservado`

Não implementar sem backend caso esses dados não existam; preparar arquitetura.

## Campos úteis

- gerir quantidade;
- permitir venda sem estoque;
- vender por encomenda;
- prazo de produção/envio;
- estoque mínimo;
- estoque de segurança;
- lead time;
- fornecedor principal.

Se o sistema tiver múltiplos centros/lojas, suportar estoque por localização.

---

# 16. Mídia

Redesenhar completamente a área.

## Imagem principal

- drag & drop;
- preview;
- substituir;
- remover;
- validação de tamanho/formato;
- alt text;
- indicação de capa.

## Galeria

- thumbnails reais;
- drag para ordenar;
- definir capa;
- remover;
- editar alt text;
- progresso de upload;
- falha individual por arquivo.

## Vídeo

- upload ou URL conforme backend atual;
- preview;
- validação;
- estado de processamento.

Evitar grandes áreas vazias quando não houver mídia.

---

# 17. Variações

Manter a ideia de geração em massa, porém remover o tratamento visual excessivamente chamativo.

## Criador de opções

Exemplo:

```text
Opção: Cor
Valores: Preto, Branco, Azul

Opção: Tamanho
Valores: P, M, G

[Gerar combinações]
```

Depois gerar matriz editável.

## Grade de variantes

Por variante:

- imagem;
- opção/combinação;
- SKU;
- GTIN;
- preço;
- custo;
- estoque;
- peso quando diferente;
- status.

Adicionar:

- edição em massa;
- seleção de variantes;
- gerar SKUs automaticamente;
- duplicar;
- desativar combinação;
- validação de SKU duplicado.

---

# 18. Fiscal — reestruturação crítica

A área fiscal precisa ser tratada como **perfil fiscal do produto**, e não como uma tentativa de armazenar toda a NF-e dentro do produto.

Vários valores finais de uma NF-e dependem de:

- natureza da operação;
- regime tributário;
- UF de origem;
- UF de destino;
- cliente;
- finalidade;
- benefício fiscal;
- regras vigentes.

Portanto:

- guardar no produto dados e defaults fiscais aplicáveis;
- calcular impostos finais em um motor/regra fiscal transacional;
- versionar tabelas fiscais;
- não hardcodar alíquotas e classificações que mudam por legislação.

## Dados fiscais do produto

Avaliar suporte a:

### Identificação/classificação

- NCM;
- CEST quando aplicável;
- origem da mercadoria;
- GTIN/EAN comercial;
- GTIN tributável quando aplicável;
- unidade comercial;
- unidade tributável;
- fator de conversão;
- EX TIPI quando aplicável;
- código de benefício fiscal (`cBenef`) quando aplicável por UF/regra;
- código de enquadramento de IPI quando aplicável.

### ICMS

Perfis/defaults conforme regime:

- CST ou CSOSN;
- modalidade de BC;
- alíquota;
- redução de BC;
- MVA;
- ICMS-ST;
- FCP;
- desoneração quando aplicável.

Não exibir todos os campos o tempo inteiro. Usar formulários condicionais conforme CST/CSOSN.

### IPI

Quando aplicável:

- CST IPI;
- código de enquadramento;
- alíquota;
- tipo de cálculo.

### PIS / COFINS

Quando aplicável:

- CST;
- alíquota;
- tipo/base de cálculo.

### CFOP

Não tratar um único CFOP como verdade absoluta do produto.

Permitir perfis/defaults por cenário, por exemplo:

- venda dentro do estado;
- venda interestadual;
- devolução;
- entrada.

A seleção final deve pertencer à regra fiscal da operação.

---

# 19. Reforma Tributária — IBS/CBS

O sistema deve ser preparado para a evolução da NF-e/NFC-e no ciclo da Reforma Tributária do Consumo.

Criar arquitetura preparada para, conforme regras vigentes:

- CST de IBS/CBS;
- `cClassTrib`;
- `cCredPres` quando aplicável;
- alíquotas e grupos associados;
- validações por versão de Nota Técnica;
- regras específicas conforme operação.

Como essas tabelas estão sendo atualizadas, não hardcodar listas permanentes no componente React.

Criar fonte de dados/configuração versionada.

No UI exibir, quando possível:

`Tabela fiscal atualizada em: DD/MM/AAAA`

e/ou

`Versão da regra fiscal: ...`

Tratar implementação fiscal como área sensível e validar com contador/especialista fiscal responsável pelo negócio.

---

# 20. Saúde fiscal

Criar indicador no editor e na lista:

- Fiscal completo
- Fiscal incompleto
- Revisão necessária

Exemplos de pendência:

- NCM ausente;
- GTIN inválido;
- origem ausente;
- regra tributária incompleta;
- classificação IBS/CBS faltante quando exigida.

Não classificar como erro algo que seja opcional no cenário real.

---

# 21. Logística

Evoluir a seção atual.

Campos:

- peso bruto;
- peso líquido, se necessário;
- comprimento;
- largura;
- altura;
- embalagem;
- quantidade por embalagem;
- agrupar caixas;
- produto físico / digital;
- prazo adicional de manuseio;
- restrições de transporte quando houver.

Preparar suporte a:

- dimensões por variante;
- pacote padrão;
- múltiplos volumes;
- origem de expedição.

---

# 22. SEO & Canais

Renomear `SEO & Extras` para algo com função clara, por exemplo:

`SEO & Canais`

## SEO

- meta title;
- contador;
- meta description;
- contador;
- slug;
- preview de busca;
- canonical, se existir suporte real;
- status de indexação quando aplicável.

## Dados de catálogo para canais

Adicionar campos quando fizer sentido:

- marca;
- GTIN;
- MPN;
- condition;
- categoria Google;
- identificador existe;
- item group ID para variantes;
- atributos de cor/tamanho;
- disponibilidade.

Mostrar `Prontidão para Google Merchant`, se houver integração.

## Publicação

Permitir visualizar canais:

- Loja
- Google
- Meta
- Marketplace
- B2B

Somente mostrar canais realmente existentes no sistema.

---

# 23. Metacampos e complementos

Criar seção extensível para dados especializados:

- metafields/campos personalizados;
- manuais/PDFs;
- garantia;
- ficha técnica adicional;
- produtos relacionados;
- acessórios;
- cross-sell;
- upsell;
- bundles/kits;
- data de lançamento;
- conteúdo regulatório;
- alertas de segurança.

Não colocar tudo diretamente no formulário básico.

---

# 24. Auditoria

Evoluir a aba Auditoria.

## Filtros

- período;
- usuário;
- produto;
- SKU;
- tipo de evento;
- origem;
- resultado.

## Eventos

Exemplos:

- produto criado;
- produto atualizado;
- preço alterado;
- estoque alterado;
- variante criada;
- status alterado;
- dados fiscais alterados;
- produto publicado;
- produto arquivado.

## Detalhe

Ao abrir evento:

- data/hora;
- ator;
- origem;
- campo;
- valor anterior;
- valor novo.

Usar diff visual.

A opção de reverter alteração só deve existir quando o backend suportar reversão segura.

---

# 25. Ações de produtividade

Planejar, conforme backend:

- duplicar produto;
- importar CSV;
- exportar CSV;
- edição em massa;
- templates de produto;
- templates fiscais;
- templates de ficha técnica;
- atualização em massa de categoria;
- atualização em massa de tags;
- agendar publicação;
- agendar promoção;
- histórico de preço;
- validação de duplicidade de SKU/GTIN.

---

# 26. Qualidade e completude do produto

Criar uma pequena área no editor:

`Qualidade do cadastro`

Exemplo:

```text
82% completo

✓ Informações básicas
✓ Estoque
! Fiscal: NCM ausente
! Mídia: sem imagem secundária
✓ SEO
```

Regras devem ser objetivas e configuráveis.

Não bloquear salvamento por recomendações opcionais.

Bloquear publicação apenas quando regra obrigatória real exigir.

---

# 27. Estados de publicação

Separar salvar de publicar.

Estados recomendados:

- Rascunho
- Ativo/Publicado
- Inativo
- Arquivado

Se o sistema ainda não suporta essa separação, não inventar comportamento silenciosamente; marcar como dependência de backend.

---

# 28. Comportamento de validação

Ao clicar salvar:

- validar campos necessários para salvar;
- exibir erros inline;
- manter dados digitados;
- focar primeiro erro relevante;
- indicar aba que contém erro.

Ao publicar:

- aplicar validações adicionais de publicação;
- listar pendências;
- permitir salvar como rascunho quando adequado.

---

# 29. Estado vazio da lista

Trocar:

`Nenhum produto atende aos filtros atuais.`

por um estado mais útil:

```text
Nenhum produto encontrado

Não encontramos produtos com os filtros atuais.

[Limpar filtros] [+ Novo Produto]
```

---

# 30. Estado vazio do dashboard

Quando não houver vendas:

Não mostrar uma grande tabela vazia sem contexto.

Mostrar:

```text
Ainda não há vendas neste período

Assim que os produtos começarem a vender, os dados aparecerão aqui.

[Ver produtos]
```

KPIs podem continuar mostrando zero.

---

# 31. Estrutura sugerida de componentes

Exemplo, adaptar ao projeto:

```text
AdminProducts/
  AdminProductsPage.jsx

  dashboard/
    CatalogDashboard.jsx
    KpiGrid.jsx
    CatalogHealthCard.jsx
    SalesTrendChart.jsx
    TopProductsTable.jsx

  products/
    ProductsList.jsx
    ProductsToolbar.jsx
    ProductsFilters.jsx
    ProductsTable.jsx
    BulkActionsBar.jsx

  editor/
    ProductEditor.jsx
    ProductEditorHeader.jsx
    ProductEditorTabs.jsx
    ProductCompletion.jsx

    sections/
      GeneralSection.jsx
      TechnicalSpecsSection.jsx
      InventorySection.jsx
      MediaSection.jsx
      VariantsSection.jsx
      FiscalSection.jsx
      LogisticsSection.jsx
      SeoChannelsSection.jsx

  metrics/
    MetricsCatalogDialog.jsx
    MetricDefinition.jsx

  audit/
    AuditTrail.jsx
    AuditFilters.jsx
    AuditEventDetails.jsx

  shared/
    DateRangeFilter.jsx
    FilterBar.jsx
    ActiveFilterChips.jsx
    SaveButton.jsx
    UnsavedChangesGuard.jsx

  hooks/
  schemas/
  services/
  utils/
  constants/
```

Não seguir esta árvore cegamente se a arquitetura atual do projeto possuir convenções melhores.

---

# 32. Fases de implementação

## Fase 1 — Auditoria

- mapear código;
- identificar regras;
- identificar riscos;
- documentar dependências.

## Fase 2 — Foundation

- tokens;
- botões;
- filter bar;
- date range;
- toasts;
- empty states;
- tabs;
- save state.

## Fase 3 — Shell do AdminProducts

- header;
- navegação;
- dashboard;
- products;
- auditoria.

## Fase 4 — Lista de produtos

- filtros;
- tabela;
- ações;
- estados;
- paginação.

## Fase 5 — Editor

- header sticky;
- salvar sem sair;
- unsaved changes;
- abas;
- seções.

## Fase 6 — Fiscal

- reorganização;
- regras condicionais;
- dados IBS/CBS;
- arquitetura versionável.

## Fase 7 — QA

- responsividade;
- teclado;
- validação;
- loading;
- erro;
- testes;
- regressão de regras existentes.

---

# 33. Requisitos técnicos não negociáveis

- preservar contratos de API;
- não apagar regra existente porque não aparece nas imagens;
- não usar mocks em caminho de produção;
- não fazer refatoração visual que altere cálculo;
- evitar `useEffect` duplicado ou fetch redundante;
- manter tratamento de permissões;
- manter compatibilidade com rotas;
- não criar componente monolítico;
- não hardcodar tabelas fiscais voláteis;
- não esconder erro de backend com mensagem genérica quando houver mensagem segura e útil;
- não fechar o editor após salvar.

---

# 34. Critérios de aceite específicos

A entrega está pronta quando:

- o layout do módulo foi reestruturado;
- o menu afundado foi preservado e refinado;
- há filtro por data inicial/final;
- há presets de período;
- filtros avançados existem ou estão arquitetados;
- refresh possui estado e timestamp;
- catálogo de métricas foi melhorado;
- lista de produtos ficou operacional;
- editor não fecha ao salvar;
- há toast de salvamento;
- há indicador de alterações não salvas;
- voltar/cancelar protege contra perda;
- tabs do editor são consistentes;
- fiscal foi reorganizado;
- IBS/CBS foi considerado na arquitetura;
- loading/empty/error/success estão completos;
- desktop/tablet/mobile funcionam;
- acessibilidade de teclado foi validada;
- regras de negócio atuais continuam funcionando.

---

# 35. Entrega final esperada do agente

Entregar no final:

1. diagnóstico do código atual;
2. lista de problemas encontrados;
3. arquitetura final;
4. componentes criados;
5. arquivos alterados;
6. regras mantidas;
7. funcionalidades novas implementadas;
8. funcionalidades que dependem de backend;
9. testes executados;
10. riscos restantes;
11. screenshots ou descrição objetiva do novo fluxo.

---

# 36. Ordem de prioridade de funcionalidades

## P0 — obrigatório nesta refatoração

- novo layout;
- menu afundado refinado;
- filtros melhores;
- date range inicial/final;
- presets de período;
- novo SaveButton;
- salvar sem sair;
- notificações;
- unsaved changes;
- refresh com feedback;
- lista de produtos;
- criação/edição responsiva;
- estados de loading/error/empty;
- reorganização fiscal.

## P1 — alta prioridade

- saúde do catálogo;
- filtros avançados;
- colunas configuráveis;
- bulk actions;
- catálogo de métricas melhorado;
- margem/custo;
- estoque mínimo;
- melhoria das variantes;
- campos de Google Merchant;
- perfis fiscais;
- IBS/CBS.

## P2 — evolução

- visualizações salvas;
- dashboard configurável;
- templates;
- multiestoque;
- agendamento de publicação;
- agendamento de promoção;
- auto-refresh;
- importação avançada;
- score de catálogo;
- integrações de canais;
- bundles/kits.

---

# 37. Observação fiscal

A implementação de NF-e deve acompanhar o **Portal Nacional da NF-e**, MOC, Notas Técnicas e tabelas oficiais vigentes.

Em 2026 houve evolução relevante dos leiautes relacionados à Reforma Tributária do Consumo, incluindo IBS/CBS, `cClassTrib` e outros grupos. Portanto, a UI deve ser desenhada para consumir regras/configurações versionadas, e não para congelar legislação em JSX.

A validação final de regras tributárias deve envolver o responsável fiscal/contábil do negócio.

---

# 38. Comando final para execução

Execute a refatoração de `@AdminProducts.jsx` seguindo integralmente este documento, `@MASTER_ADMIN_UI_UX_REFACTOR.md` e `@ui-ux-guidelines.md`.

Primeiro faça a auditoria técnica do módulo e preserve todas as regras atuais. Em seguida, refatore a arquitetura e a interface em etapas, mantendo o projeto funcional a cada fase.

Não entregue somente recomendações: implemente o novo padrão visual e os comportamentos que já forem compatíveis com o backend atual. Para itens sem suporte de backend, prepare a arquitetura, marque explicitamente a dependência e não simule dados reais.
