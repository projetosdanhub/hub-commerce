# HUB Commerce --- UI/UX Design System & Refactoring Rules

**Documento de referência para refatoração global do Admin SaaS**\
**Versão:** 1.0\
**Produto:** HUB Commerce / HUB Admin\
**Objetivo:** transformar o layout atual em uma experiência SaaS
**minimal premium, clean, consistente, fluida, responsiva, acessível e
escalável**, sem perder a identidade visual já aprovada no menu lateral
e na barra superior.

------------------------------------------------------------------------

## 1. MISSÃO DA REFATORAÇÃO

Você é responsável por executar uma **refatoração global de UI/UX** no
HUB Commerce Admin.

Não trate este documento como sugestão visual isolada. Ele deve ser
considerado o **Design System oficial da aplicação**.

A refatoração deve:

-   preservar a estrutura funcional existente;
-   preservar regras de negócio, endpoints, integrações e comportamentos
    já funcionais;
-   preservar o menu lateral e a barra superior como referência visual;
-   padronizar todas as telas;
-   eliminar inconsistências de espaçamento, tipografia, tamanhos,
    ícones, cards, filtros e botões;
-   criar uma linguagem visual única para todo o sistema;
-   melhorar hierarquia visual e legibilidade;
-   melhorar responsividade;
-   melhorar acessibilidade;
-   melhorar feedback visual;
-   criar microinterações profissionais;
-   criar estados de loading, vazio, erro e sucesso consistentes;
-   preparar a interface para crescimento futuro;
-   evitar aparência de template genérico;
-   manter uma estética **white/clean + SaaS premium**, com uso
    controlado de glassmorphism;
-   garantir que a interface pareça produto SaaS profissional e não
    painel administrativo amador.

### Regra principal

> **Não redesenhe cada página de maneira independente. Crie primeiro um
> sistema visual e depois aplique esse sistema a todas as páginas.**

------------------------------------------------------------------------

# 2. REFERÊNCIA VISUAL ATUAL

As telas atuais enviadas para análise mostram uma base visual já
funcional e relativamente consistente.

### Elementos aprovados como referência

O seguinte deve ser preservado conceitualmente:

1.  **Menu lateral**
    -   branco;
    -   borda discreta;
    -   navegação organizada por grupos;
    -   item ativo destacado;
    -   ícones à esquerda;
    -   hierarquia clara;
    -   botão "Ver Loja Online" no rodapé;
    -   possibilidade de recolher/expandir.
2.  **Topbar**
    -   branca;
    -   busca global;
    -   notificações;
    -   avatar;
    -   perfil do administrador;
    -   separação visual discreta;
    -   aparência limpa.
3.  **Fundo geral**
    -   extremamente claro;
    -   sensação de espaço;
    -   conteúdo centralizado;
    -   sem excesso de elementos decorativos.
4.  **Azul como cor de ação**
    -   usado para links, ações primárias, estados ativos e elementos
        interativos.
5.  **Cards**
    -   cantos arredondados;
    -   sombras suaves;
    -   bordas discretas;
    -   aparência premium;
    -   bastante espaço interno.

### O que deve ser melhorado

-   métricas atualmente muito fragmentadas;
-   excesso de cards independentes;
-   falta de um sistema universal de componentes;
-   variações desnecessárias de títulos e subtítulos;
-   ícones sem padronização absoluta;
-   filtros com comportamentos diferentes;
-   botões com dimensões inconsistentes;
-   estados de loading inconsistentes;
-   falta de uma linguagem única de hover;
-   excesso de espaço em alguns pontos e falta em outros;
-   hierarquia tipográfica irregular;
-   tabelas precisam de melhor densidade e leitura;
-   componentes precisam responder melhor a diferentes resoluções;
-   microinterações precisam ser padronizadas;
-   ações secundárias devem ter menos peso visual;
-   uso de cores semânticas deve seguir tokens;
-   scrollbars precisam ter aparência refinada;
-   componentes precisam possuir estados explícitos.

------------------------------------------------------------------------

# 3. PRINCÍPIOS DE DESIGN

Todos os componentes devem seguir estes princípios.

## 3.1 Minimal Premium

A interface deve parecer:

-   sofisticada;
-   moderna;
-   limpa;
-   rápida;
-   confiável;
-   tecnológica;
-   profissional;
-   discreta.

Evitar:

-   excesso de gradientes;
-   excesso de sombras;
-   excesso de bordas coloridas;
-   excesso de animações;
-   elementos gigantes;
-   cores saturadas sem função;
-   glassmorphism exagerado;
-   efeitos neon;
-   aparência gamer;
-   aparência de template pronto.

------------------------------------------------------------------------

## 3.2 White Clean

A base da interface deve ser clara.

Prioridade:

1.  branco;
2.  branco quebrado;
3.  cinza muito claro;
4.  cinza neutro;
5.  azul institucional;
6.  cores semânticas somente quando necessárias.

O sistema não deve virar um dashboard dark.

Dark mode não é requisito desta refatoração. A arquitetura, entretanto,
deve permitir implementação futura sem refatoração estrutural.

------------------------------------------------------------------------

## 3.3 Hierarquia antes de decoração

A interface deve comunicar:

**O que é? → O que importa? → O que posso fazer? → O que aconteceu?**

Nunca utilizar efeitos visuais para compensar falta de hierarquia.

------------------------------------------------------------------------

## 3.4 Consistência

O mesmo conceito deve ter:

-   mesma aparência;
-   mesmo tamanho;
-   mesmo comportamento;
-   mesma animação;
-   mesma semântica;
-   mesma posição relativa.

Exemplo:

Todo botão de refresh deve ser visual e funcionalmente equivalente em
qualquer módulo.

------------------------------------------------------------------------

# 4. DESIGN TOKENS

Criar tokens centralizados.

Nunca espalhar valores arbitrários pelo código.

## 4.1 Cores

Criar variáveis equivalentes a:

``` css
--color-primary-50
--color-primary-100
--color-primary-200
--color-primary-300
--color-primary-400
--color-primary-500
--color-primary-600
--color-primary-700
--color-primary-800
--color-primary-900

--color-success-50
--color-success-500
--color-success-600

--color-warning-50
--color-warning-500
--color-warning-600

--color-danger-50
--color-danger-500
--color-danger-600

--color-info-50
--color-info-500
--color-info-600

--color-neutral-0
--color-neutral-50
--color-neutral-100
--color-neutral-200
--color-neutral-300
--color-neutral-400
--color-neutral-500
--color-neutral-600
--color-neutral-700
--color-neutral-800
--color-neutral-900
```

### Diretriz

O azul institucional deve ser o principal destaque interativo.

Verde:

-   sucesso;
-   receita;
-   crescimento positivo;
-   pagamento confirmado;
-   status ativo.

Vermelho:

-   erro;
-   cancelamento;
-   reembolso;
-   estoque crítico;
-   ação destrutiva.

Amarelo/âmbar:

-   atenção;
-   pendência;
-   análise;
-   aviso.

Roxo:

-   funcionalidades especiais;
-   afiliados;
-   recursos premium;
-   categorias específicas quando semanticamente justificadas.

------------------------------------------------------------------------

# 5. TIPOGRAFIA

Escolher uma família sans-serif moderna e altamente legível.

A preferência é uma família consistente em toda a aplicação.

Exemplo de hierarquia:

``` text
Display / Page Title
32px / 40px / 700

H1
28px / 36px / 700

H2
22px / 30px / 700

H3
18px / 26px / 700

Body Large
16px / 24px / 400

Body
14px / 22px / 400

Body Small
13px / 20px / 400

Caption
12px / 18px / 500

Label
12px / 16px / 600
```

### Regras

-   títulos nunca devem parecer pesados demais;
-   subtítulos devem ter contraste menor;
-   labels devem ser curtos;
-   textos auxiliares devem utilizar cinza;
-   evitar ALL CAPS em textos longos;
-   ALL CAPS somente para pequenas labels de métricas, tabs ou
    categorias;
-   números de métricas devem ter excelente legibilidade;
-   valores monetários devem utilizar peso forte.

------------------------------------------------------------------------

# 6. ESPAÇAMENTO

Criar escala baseada em múltiplos de 4.

``` text
4px
8px
12px
16px
20px
24px
32px
40px
48px
64px
80px
```

Não criar valores arbitrários como:

``` text
17px
23px
27px
31px
37px
```

exceto quando tecnicamente necessário.

------------------------------------------------------------------------

# 7. BORDER RADIUS

Criar tokens:

``` text
radius-xs   = 6px
radius-sm   = 8px
radius-md   = 12px
radius-lg   = 16px
radius-xl   = 20px
radius-2xl  = 24px
radius-pill = 999px
```

Uso:

-   inputs: 10--12px;
-   botões: 10--12px;
-   cards: 16--20px;
-   containers principais: 20--24px;
-   badges: pill;
-   avatar: circular.

Evitar arredondamento excessivo.

------------------------------------------------------------------------

# 8. SOMBRAS

A sombra deve ser extremamente discreta.

Exemplo:

``` css
--shadow-xs
--shadow-sm
--shadow-md
--shadow-lg
```

Preferir:

-   sombras difusas;
-   baixa opacidade;
-   pouco deslocamento;
-   aparência de profundidade real.

Nunca utilizar sombras pretas pesadas.

------------------------------------------------------------------------

# 9. BORDAS

Padrão:

``` text
1px solid rgba(...)
```

Bordas devem separar áreas, não chamar atenção.

### Hover premium

Ao passar o mouse:

-   elevar levemente;
-   alterar sombra;
-   alterar borda;
-   opcionalmente aplicar um halo extremamente sutil na cor primária.

Exemplo conceitual:

``` text
normal:
border neutral
shadow xs

hover:
border primary 15–25%
shadow sm
transform translateY(-1px)
```

Não exagerar.

------------------------------------------------------------------------

# 10. GLASSMORPHISM

Utilizar somente em componentes adequados.

Pode ser aplicado em:

-   popovers;
-   dropdowns;
-   overlays;
-   filtros expansíveis;
-   menus flutuantes;
-   elementos de navegação;
-   pequenas áreas de destaque.

Não transformar toda a aplicação em vidro.

Regra:

> Glassmorphism é detalhe premium, não identidade estrutural.

Usar:

-   background branco translúcido;
-   backdrop blur;
-   borda clara;
-   sombra sutil.

Garantir fallback para navegadores sem suporte.

------------------------------------------------------------------------

# 11. LAYOUT GLOBAL

Estrutura recomendada:

``` text
App
├── Sidebar
├── MainShell
│   ├── Topbar
│   └── PageContent
│       ├── PageHeader
│       ├── PageToolbar
│       ├── Content
│       └── Sections
```

### Sidebar

Manter conceito atual.

Estados:

``` text
expanded
collapsed
mobile
```

### Sidebar expanded

Deve exibir:

-   logo;
-   nome do sistema;
-   subtítulo;
-   grupos;
-   ícones;
-   labels;
-   estado ativo;
-   botão inferior.

### Sidebar collapsed

Exibir:

-   somente ícones;
-   tooltip;
-   estado ativo;
-   acesso ao menu.

### Mobile

Não manter sidebar fixa.

Utilizar:

-   drawer;
-   overlay;
-   botão menu;
-   fechamento automático após navegação.

------------------------------------------------------------------------

# 12. TOPBAR

Manter a identidade atual.

Estrutura:

``` text
[collapse] [global search] ................ [notifications] [divider] [avatar] [user] [chevron]
```

### Busca global

Placeholder:

``` text
Buscar pedidos, clientes, produtos...
```

Com:

-   ícone SVG;
-   foco visível;
-   atalho de teclado futuro;
-   debounce;
-   sugestões;
-   navegação por teclado.

------------------------------------------------------------------------

# 13. PAGE HEADER

Todas as páginas devem seguir o mesmo padrão.

``` text
[ícone opcional]

Título da página
Descrição curta e objetiva

[ações]
```

Exemplo:

``` text
Gestão de Pedidos
Acompanhe transações, status logístico e fluxo de caixa.
```

### Regras

-   título: H1;
-   descrição: texto secundário;
-   ações alinhadas à direita em desktop;
-   empilhadas em mobile;
-   espaçamento consistente.

------------------------------------------------------------------------

# 14. MÉTRICAS --- NOVO PADRÃO GLOBAL

Este é um dos pontos mais importantes da refatoração.

## Não utilizar vários cards soltos para métricas principais.

Criar um componente:

``` text
MetricsRail
```

ou

``` text
MetricsCarousel
```

### Estrutura

Uma única faixa horizontal:

``` text
┌──────────────────────────────────────────────────────────────────────┐
│ Receita │ Conversão │ Pedidos │ Cancelados │ Reembolsos │ Análise │
└──────────────────────────────────────────────────────────────────────┘
                         ───────────────
                         scrollbar
```

Cada métrica ocupa uma coluna/flex.

### Desktop

Distribuir proporcionalmente.

### Conteúdo

Cada item:

``` text
[ícone]

LABEL
Valor principal

informação auxiliar
```

### Estados

-   normal;
-   hover;
-   active;
-   loading;
-   disabled.

### Hover

Ao passar:

-   background extremamente sutil;
-   borda discreta;
-   pequeno destaque no ícone;
-   cursor quando clicável.

### Scrollbar

Quando houver overflow horizontal:

-   fina;
-   discreta;
-   arredondada;
-   normalmente quase invisível;
-   torna-se um pouco mais escura no hover;
-   thumb com transição suave.

Nunca usar scrollbar visualmente pesada.

### Responsividade

Desktop:

``` text
display: grid/flex
```

Tablet:

``` text
overflow-x: auto
```

Mobile:

``` text
horizontal scroll
snap optional
```

Não reduzir tanto a métrica que prejudique leitura.

------------------------------------------------------------------------

# 15. ÍCONES

Todos os ícones devem ser SVG.

## Proibido

-   emojis;
-   Unicode como ícone;
-   imagens rasterizadas para ícones;
-   mistura de bibliotecas;
-   ícones de estilos diferentes.

Escolher uma única biblioteca SVG consistente.

Exemplos possíveis:

-   Lucide;
-   Radix Icons;
-   outra biblioteca SVG consistente já existente no projeto.

### Diretriz

Preferência por ícones:

-   outline;
-   stroke consistente;
-   simples;
-   modernos.

### Tamanhos

``` text
12px — micro
14px — small
16px — padrão
18px — botão
20px — navegação
24px — destaque
```

Não misturar 16, 17, 19, 21 sem necessidade.

------------------------------------------------------------------------

# 16. TOOLTIP

Todo ícone cuja função não seja autoexplicativa deve possuir tooltip.

Exemplos:

-   refresh;
-   exportar;
-   calendário;
-   ocultar valor;
-   configurações;
-   ações rápidas;
-   ícones da sidebar recolhida.

Tooltip deve:

-   aparecer após pequeno delay;
-   possuir animação;
-   não piscar;
-   possuir contraste suficiente;
-   funcionar por teclado;
-   não bloquear a ação.

Não utilizar tooltip para textos que já estão claramente escritos.

------------------------------------------------------------------------

# 17. BOTÕES

Criar sistema único:

``` text
Button
├── primary
├── secondary
├── tertiary
├── ghost
├── danger
├── success
├── icon
└── loading
```

### Primary

Ação principal.

### Secondary

Ação importante, porém secundária.

### Ghost

Ação discreta.

### Icon

Somente ícone.

Sempre adicionar tooltip quando necessário.

### Estados

``` text
default
hover
active
focus
disabled
loading
```

### Animação

Transição curta:

``` text
150–220ms
```

Nunca criar animação lenta em ações simples.

------------------------------------------------------------------------

# 18. REFRESH

Criar componente universal:

``` text
RefreshButton
```

Com:

-   SVG;
-   tooltip;
-   hover;
-   active;
-   rotação do ícone;
-   estado loading.

Ao clicar:

1.  bloquear múltiplos cliques;
2.  iniciar animação;
3.  disparar atualização;
4.  mostrar skeleton;
5.  atualizar dados;
6.  finalizar animação;
7.  retornar ao estado normal.

------------------------------------------------------------------------

# 19. AUTO REFRESH

O backend/dados devem atualizar automaticamente a cada **15 segundos**,
conforme a regra de negócio atual.

### Regras

-   atualizar sem destruir a interface;
-   preservar posição de scroll;
-   preservar filtros;
-   preservar tab ativa;
-   evitar flicker;
-   evitar skeleton completo a cada atualização automática.

### Importante

Skeleton completo:

-   entrada na página;
-   mudança relevante de contexto;
-   refresh manual.

Atualização automática:

-   utilizar atualização incremental;
-   atualizar apenas dados alterados quando possível.

------------------------------------------------------------------------

# 20. SKELETON

Criar sistema global:

``` text
Skeleton
SkeletonText
SkeletonCircle
SkeletonCard
SkeletonTable
SkeletonMetric
SkeletonPage
```

### Aparência

-   cinza claro;
-   brilho animado;
-   velocidade suave;
-   sem exagero.

### Regra UX

Skeleton deve reproduzir aproximadamente o tamanho real do conteúdo.

Não usar spinner como única indicação de carregamento.

------------------------------------------------------------------------

# 21. FILTROS

Todos os filtros devem seguir o mesmo padrão.

Criar:

``` text
FilterButton
FilterPanel
FilterField
FilterDateRange
FilterSelect
FilterActions
ActiveFilterChip
```

------------------------------------------------------------------------

# 22. FILTRO EXPANSÍVEL

Ao clicar no botão:

``` text
Filtros
```

o painel deve expandir suavemente.

Animação:

``` text
opacity
transform
height/grid
```

Evitar animação agressiva.

Fluxo:

``` text
[ Filtros ]

↓ clique

┌────────────────────────────────────┐
│ Filtros                            │
│                                    │
│ Data inicial    Data final         │
│ [__________]    [__________]       │
│                                    │
│ Status          Categoria          │
│ [__________]    [__________]       │
│                                    │
│ [Limpar]                [Aplicar] │
└────────────────────────────────────┘
```

### Ações

-   Limpar;
-   Aplicar.

### Após aplicar

Mostrar filtros ativos como chips:

``` text
Data: 01/08/2026 → 31/08/2026   ×
Status: Ativo                    ×
```

------------------------------------------------------------------------

# 23. FILTRO DE DATA

Criar componente único.

Possibilidades:

-   data inicial;
-   data final;
-   período;
-   presets.

Presets futuros:

``` text
Hoje
Ontem
Últimos 7 dias
Últimos 30 dias
Este mês
Mês passado
Personalizado
```

------------------------------------------------------------------------

# 24. FILTRO DE ANIVERSÁRIO DO CRM

O filtro de aniversário deve seguir o mesmo sistema.

Exemplo:

``` text
Aniversário:
[ Todos os meses ▼ ]
```

Ao expandir:

``` text
Todos os meses
Janeiro
Fevereiro
...
Dezembro
```

Adicionar estado visual ativo.

------------------------------------------------------------------------

# 25. TABS / MENUS SAAS

Utilizar o padrão visual de tabs já presente nas telas.

Exemplo:

``` text
[ PAINEL ] [ CLIENTES ] [ BENEFÍCIOS ] [ CONFIGURAÇÕES ]
```

### Regras

-   container com background neutro;
-   item ativo com superfície branca;
-   sombra muito leve;
-   borda discreta;
-   texto ativo azul;
-   transição suave;
-   altura consistente.

### Mobile

Permitir scroll horizontal.

Nunca quebrar tabs em várias linhas sem necessidade.

------------------------------------------------------------------------

# 26. TABELAS

Criar componente global:

``` text
DataTable
```

### Cabeçalho

-   label;
-   uppercase somente quando adequado;
-   fonte pequena;
-   contraste moderado;
-   espaçamento consistente.

### Linhas

-   altura consistente;
-   hover sutil;
-   divisores discretos;
-   dados alinhados corretamente.

### Estados

``` text
loading
empty
error
success
hover
selected
```

### Ações

Utilizar:

``` text
[ visualizar ]
[ editar ]
[ mais ]
```

Preferencialmente icon buttons com tooltip.

------------------------------------------------------------------------

# 27. STATUS BADGES

Criar componente:

``` text
StatusBadge
```

Exemplos:

``` text
ATIVO
INATIVO
ENVIADO
ENTREGUE
CANCELADO
REEMBOLSADO
EM ANÁLISE
PENDENTE
```

Cada estado deve possuir token semântico.

Não utilizar cor arbitrária.

------------------------------------------------------------------------

# 28. CARDS

Cards devem possuir propósito.

Evitar:

> card dentro de card dentro de card.

Estrutura:

``` text
Card
├── CardHeader
├── CardContent
└── CardFooter
```

### Hover

Somente quando clicável.

Cards puramente informativos não precisam de hover exagerado.

------------------------------------------------------------------------

# 29. DASHBOARDS

Dashboard deve priorizar:

1.  métricas;
2.  tendências;
3.  alertas;
4.  ações;
5.  detalhamento.

Não preencher espaços vazios apenas para "deixar bonito".

------------------------------------------------------------------------

# 30. GESTÃO DE PEDIDOS

Padronizar:

-   métricas em MetricsRail;
-   busca;
-   refresh;
-   filtro de período;
-   tabs de status;
-   tabela;
-   badges;
-   ações;
-   skeleton.

A área:

``` text
Todos
A Pagar
Em Separação
Separados
Enviados
Entregues
Cancelados
Reembolsados
```

deve utilizar o mesmo componente de tabs global.

------------------------------------------------------------------------

# 31. CRM

Padronizar:

### Dashboard

-   MetricsRail;
-   receita;
-   clientes;
-   pedidos;
-   LTV;
-   evolução;
-   indicadores.

### Clientes

-   tabela;
-   busca;
-   status;
-   aniversário;
-   ações.

### Perfil

Criar futuramente:

``` text
Cliente
├── resumo
├── informações
├── pedidos
├── LTV
├── benefícios
├── cashback
└── histórico
```

------------------------------------------------------------------------

# 32. CATÁLOGO

Padronizar:

``` text
Gestão de Catálogo
├── Dashboard
├── Produtos
└── Auditoria
```

### Filtro de período

Deve ser componente universal.

Exemplo:

``` text
[ Últimos 30 dias ▼ ]
```

Ao abrir:

-   opções;
-   animação;
-   seleção;
-   período personalizado.

------------------------------------------------------------------------

# 33. AFILIADOS

Manter identidade própria apenas onde houver justificativa semântica.

Estrutura:

``` text
Painel
Afiliados
Produtos elegíveis
Cupons afiliados
Saques
Configurações
```

Tabs devem seguir o mesmo componente global.

Métricas:

``` text
Produtos elegíveis
Afiliados ativos
Vendas referenciadas
Saques pendentes
Receita afiliados
```

Devem usar MetricsRail.

------------------------------------------------------------------------

# 34. ANIMAÇÕES

A aplicação deve possuir um sistema centralizado de motion.

## Durações

``` text
fast:    120ms
normal:  180ms
medium:  240ms
slow:    320ms
```

## Easing

Preferir:

``` text
ease-out
cubic-bezier(...)
```

### Utilizar animações em:

-   hover;
-   focus;
-   dropdown;
-   tooltip;
-   modal;
-   drawer;
-   filtro;
-   tabs;
-   skeleton;
-   refresh;
-   expansão;
-   collapse.

### Evitar

-   bounce;
-   zoom excessivo;
-   rotação sem função;
-   parallax;
-   animações longas;
-   animações permanentes desnecessárias.

------------------------------------------------------------------------

# 35. REDUCED MOTION

Respeitar:

``` css
@media (prefers-reduced-motion: reduce)
```

Reduzir ou remover:

-   transformações;
-   animações;
-   transições prolongadas.

A aplicação continua funcional.

------------------------------------------------------------------------

# 36. RESPONSIVIDADE

Breakpoints devem ser centralizados.

Exemplo:

``` text
mobile:   < 640px
tablet:   640–1023px
desktop:  1024–1279px
large:    1280–1535px
xl:       >= 1536px
```

Não criar layouts independentes sem necessidade.

------------------------------------------------------------------------

# 37. MOBILE

No mobile:

-   sidebar vira drawer;
-   topbar compacta;
-   busca pode virar botão;
-   métricas têm scroll horizontal;
-   tabelas possuem scroll horizontal controlado;
-   filtros podem ocupar largura total;
-   botões importantes permanecem acessíveis;
-   ações secundárias podem ficar em menu;
-   tabs possuem scroll horizontal.

Nunca esconder funcionalidade importante sem alternativa.

------------------------------------------------------------------------

# 38. ACESSIBILIDADE

Meta mínima:

**WCAG 2.2 AA quando tecnicamente aplicável.**

### Requisitos

-   navegação por teclado;
-   focus state visível;
-   labels em inputs;
-   aria-label em icon buttons;
-   contraste adequado;
-   sem depender somente de cor;
-   headings semânticos;
-   landmarks;
-   tabelas acessíveis;
-   mensagens de erro compreensíveis;
-   foco preservado em modais;
-   ESC fecha overlays quando apropriado;
-   screen reader friendly.

### Nunca fazer

``` text
<button> apenas com ícone sem aria-label
```

------------------------------------------------------------------------

# 39. FORMULÁRIOS

Todos os inputs devem seguir o mesmo padrão.

Estados:

``` text
default
hover
focus
filled
disabled
error
success
```

Estrutura:

``` text
Label
Input
Helper text
Error
```

### Regras

-   labels visíveis;
-   placeholder não substitui label;
-   mensagens de erro abaixo;
-   validação clara;
-   foco azul;
-   borda de erro sem depender somente de vermelho.

------------------------------------------------------------------------

# 40. MODAIS / DRAWERS

Criar sistema universal.

### Modal

Usar para:

-   confirmação;
-   ações importantes;
-   formulários curtos;
-   detalhes.

### Drawer

Usar para:

-   filtros;
-   detalhes;
-   configurações;
-   formulários maiores.

### Regras

-   backdrop;
-   foco preso;
-   ESC;
-   animação;
-   fechamento controlado;
-   acessibilidade.

------------------------------------------------------------------------

# 41. TOASTS / NOTIFICAÇÕES

Criar sistema:

``` text
Toast
├── success
├── error
├── warning
└── info
```

Exemplos:

``` text
Pedido atualizado com sucesso.
Filtros aplicados.
Produto salvo.
Não foi possível carregar os dados.
```

Não utilizar alert nativo do navegador para UX normal.

------------------------------------------------------------------------

# 42. EMPTY STATES

Todo módulo deve possuir empty state.

Exemplo:

``` text
[ícone]

Nenhum pedido encontrado

Não encontramos pedidos para os filtros selecionados.

[ Limpar filtros ]
```

Não mostrar tela vazia sem explicação.

------------------------------------------------------------------------

# 43. ERROR STATES

Erros devem ser humanos.

Evitar:

``` text
500 Internal Server Error
```

como única mensagem.

Preferir:

``` text
Não conseguimos carregar os pedidos.

Verifique sua conexão e tente novamente.

[ Tentar novamente ]
```

Detalhes técnicos podem existir em logs.

------------------------------------------------------------------------

# 44. LOADING

Prioridade:

1.  skeleton;
2.  loading inline;
3.  spinner somente para pequenas ações;
4.  progresso quando houver operação longa.

Nunca bloquear a aplicação inteira para uma atualização pequena.

------------------------------------------------------------------------

# 45. SEARCH

Busca deve possuir:

-   debounce;
-   loading;
-   empty state;
-   keyboard navigation;
-   clear button;
-   feedback;
-   resultados agrupados quando necessário.

------------------------------------------------------------------------

# 46. SCROLLBAR

Scrollbars customizadas devem ser discretas.

### Desktop

``` text
track:
transparent / quase invisível

thumb:
neutral-300

hover:
neutral-400
```

### Regras

-   largura fina;
-   bordas arredondadas;
-   transição;
-   não remover acessibilidade;
-   não deixar invisível em situações onde isso prejudique descoberta.

------------------------------------------------------------------------

# 47. ÍCONES DE AÇÕES

Criar padrão:

``` text
Refresh
Calendar
Filter
Search
Download
Upload
Eye
EyeOff
Edit
Trash
MoreHorizontal
ChevronDown
ChevronRight
ArrowUp
ArrowDown
Info
Check
X
```

Todos SVG e pertencentes à mesma família.

------------------------------------------------------------------------

# 48. SEGURANÇA DE FRONTEND

A refatoração visual não pode introduzir vulnerabilidades.

### Regras

-   não inserir HTML não sanitizado;
-   evitar dangerouslySetInnerHTML;
-   sanitizar conteúdo externo;
-   não expor tokens;
-   não colocar secrets no frontend;
-   não confiar em dados do cliente;
-   validar permissões no backend;
-   evitar vazamento de dados em mensagens de erro;
-   não colocar dados sensíveis em logs do browser;
-   usar CSP quando possível;
-   respeitar autenticação e autorização existentes.

------------------------------------------------------------------------

# 49. PERFORMANCE

A nova UI deve ser visualmente sofisticada sem ficar pesada.

### Regras

-   lazy loading onde adequado;
-   code splitting;
-   evitar bibliotecas duplicadas;
-   otimizar SVG;
-   evitar imagens desnecessárias;
-   evitar animações pesadas;
-   evitar re-renderizações;
-   memoização quando fizer sentido;
-   virtualização para tabelas muito grandes;
-   debounce em buscas;
-   throttle em eventos de scroll/resize;
-   preservar cache de dados quando possível.

### Importante

Não sacrificar performance por glassmorphism, blur ou animações.

------------------------------------------------------------------------

# 50. SEO

O Admin é uma aplicação autenticada, portanto SEO não deve ser tratado
como prioridade para conteúdo privado.

Ainda assim:

-   títulos de documento devem ser corretos;
-   headings semânticos;
-   URLs internas legíveis;
-   metadados quando aplicável;
-   páginas públicas devem receber SEO completo;
-   conteúdo público não deve depender exclusivamente de JS quando SEO
    for necessário;
-   imagens públicas devem possuir alt;
-   links devem possuir nomes compreensíveis.

Não adicionar SEO artificial a telas privadas.

------------------------------------------------------------------------

# 51. SEMÂNTICA HTML

Preferir:

``` html
<header>
<nav>
<main>
<section>
<article>
<footer>
<button>
<form>
<label>
<table>
```

Evitar construir toda a interface com:

``` html
<div>
```

quando existir elemento semântico adequado.

------------------------------------------------------------------------

# 52. DATA VISUALIZATION

Gráficos devem seguir a mesma linguagem visual.

Regras:

-   fundo limpo;
-   grid discreto;
-   labels legíveis;
-   tooltip;
-   legenda quando necessária;
-   cores semânticas;
-   evitar excesso de linhas;
-   animação curta;
-   responsividade.

------------------------------------------------------------------------

# 53. NÚMEROS E MOEDA

Padronizar:

``` text
R$ 1.500,00
R$ 1,5 mil
R$ 1,25 mi
```

O formato abreviado deve ser utilizado somente quando houver necessidade
de compactação.

Tooltips podem mostrar valor completo.

------------------------------------------------------------------------

# 54. DATAS

Padronizar apresentação.

Interface:

``` text
20/08/2026
```

Data + hora:

``` text
20/08/2026 às 23:56
```

Nunca misturar:

``` text
20/08/26
2026-08-20
20 Aug 2026
```

na mesma interface sem justificativa.

------------------------------------------------------------------------

# 55. DENSIDADE VISUAL

Criar três níveis:

``` text
comfortable
default
compact
```

O padrão do HUB Commerce deve ser:

**default / confortável**

Tabelas podem usar compact quando houver muitos dados.

------------------------------------------------------------------------

# 56. MICROINTERAÇÕES

Adicionar microinterações em:

-   hover;
-   foco;
-   clique;
-   seleção;
-   loading;
-   sucesso;
-   erro;
-   expansão;
-   collapse;
-   navegação.

Exemplos:

### Card

``` text
hover → translateY(-1px)
```

### Botão

``` text
hover → leve mudança de superfície
active → scale 0.98
```

### Refresh

``` text
click → rotate
```

### Dropdown

``` text
opacity + translateY
```

### Tabs

``` text
active indicator / surface transition
```

------------------------------------------------------------------------

# 57. NÃO EXAGERAR NAS ANIMAÇÕES

A sensação deve ser:

> "interface premium e responsiva"

e não:

> "interface tentando mostrar efeitos".

Se o usuário percebe a animação mais do que a ação, a animação está
exagerada.

------------------------------------------------------------------------

# 58. COMPONENTES GLOBAIS OBRIGATÓRIOS

Criar ou padronizar uma biblioteca de componentes:

``` text
AppShell
Sidebar
Topbar
GlobalSearch

PageHeader
PageToolbar
SectionHeader

MetricsRail
MetricItem

Card
StatCard
DataTable

Button
IconButton
Dropdown
Popover
Tooltip

Tabs
Tab

FilterButton
FilterPanel
FilterField
FilterDateRange
FilterSelect
FilterChip

Input
Select
DatePicker
Checkbox
Radio
Switch

Badge
StatusBadge

Modal
Drawer
Toast

Skeleton
SkeletonText
SkeletonMetric
SkeletonTable
SkeletonCard

EmptyState
ErrorState

Pagination
```

------------------------------------------------------------------------

# 59. ARQUITETURA DE COMPONENTES

Não duplicar componentes por página.

Errado:

``` text
OrdersRefreshButton
CRMRefreshButton
CatalogRefreshButton
AffiliateRefreshButton
```

Correto:

``` text
RefreshButton
```

com props/configuração.

O mesmo vale para:

-   filtros;
-   tabelas;
-   métricas;
-   tabs;
-   badges;
-   inputs;
-   botões;
-   skeletons.

------------------------------------------------------------------------

# 60. TOKENS DEVEM SER A ÚNICA FONTE DE VERDADE

Não fazer:

``` css
margin: 13px;
border-radius: 17px;
color: #123456;
```

em componentes isolados.

Fazer:

``` css
margin: var(--space-3);
border-radius: var(--radius-md);
color: var(--color-primary-600);
```

Quando um padrão mudar, alterar o token e não centenas de arquivos.

------------------------------------------------------------------------

# 61. DARK MODE FUTURO

Não implementar agora, salvo se já existir infraestrutura.

Mas:

-   não hardcodar branco/preto em todos os componentes;
-   usar tokens;
-   separar semântica de cor;
-   permitir futuro tema.

------------------------------------------------------------------------

# 62. RESPONSABILIDADE POR MÓDULO

Todos os módulos devem usar:

``` text
AppShell
PageHeader
Toolbar
Content
```

### Pedidos

``` text
PageHeader
MetricsRail
Search/Filters
StatusTabs
DataTable
```

### CRM

``` text
PageHeader
Tabs
MetricsRail
Insights
CustomerTable
```

### Catálogo

``` text
PageHeader
Tabs
PeriodFilter
MetricsRail
ProductTable
```

### Afiliados

``` text
PageHeader
Tabs
PeriodFilter
MetricsRail
AffiliateInsights
Tables
```

------------------------------------------------------------------------

# 63. FILTROS PERSISTENTES

Quando fizer sentido:

-   manter filtro ao trocar de tab;
-   manter filtro ao atualizar;
-   manter filtro ao retornar à página;
-   refletir filtros ativos na URL quando aplicável.

Nunca perder contexto do usuário sem motivo.

------------------------------------------------------------------------

# 64. REFRESH E PRESERVAÇÃO DE CONTEXTO

Ao atualizar:

Preservar:

-   tab;
-   filtros;
-   busca;
-   paginação quando apropriado;
-   scroll;
-   ordenação.

Não resetar tudo.

------------------------------------------------------------------------

# 65. ESTADOS DE INTERFACE

Cada componente interativo deve ser pensado com:

``` text
Default
Hover
Focus
Active
Disabled
Loading
Success
Error
Empty
```

Se um componente não possui estado definido, ele ainda não está pronto.

------------------------------------------------------------------------

# 66. Z-INDEX

Criar escala centralizada.

Exemplo:

``` text
base
sticky
dropdown
popover
drawer
modal
toast
```

Não usar valores aleatórios como:

``` text
z-index: 999999;
```

------------------------------------------------------------------------

# 67. FORMA DE IMPLEMENTAÇÃO

Antes de alterar páginas individualmente:

### Fase 1 --- Auditoria

Mapear:

-   componentes existentes;
-   estilos duplicados;
-   bibliotecas de ícones;
-   tokens;
-   cores;
-   fontes;
-   breakpoints;
-   componentes de loading;
-   filtros;
-   tabelas;
-   botões.

### Fase 2 --- Design System

Criar:

-   tokens;
-   typography;
-   spacing;
-   colors;
-   radius;
-   shadows;
-   motion.

### Fase 3 --- Componentes

Refatorar componentes globais.

### Fase 4 --- AppShell

Padronizar:

-   Sidebar;
-   Topbar;
-   PageShell.

### Fase 5 --- Métricas

Implementar MetricsRail global.

### Fase 6 --- Inputs / filtros

Implementar sistema global.

### Fase 7 --- Tables / states

Implementar:

-   table;
-   skeleton;
-   empty;
-   error;
-   status.

### Fase 8 --- Aplicar nos módulos

Ordem:

1.  Pedidos;
2.  CRM;
3.  Catálogo;
4.  Afiliados;
5.  demais módulos.

### Fase 9 --- QA

Testar:

-   desktop;
-   tablet;
-   mobile;
-   teclado;
-   loading;
-   erro;
-   empty;
-   refresh;
-   filtros;
-   auto refresh.

------------------------------------------------------------------------

# 68. REGRA CRÍTICA: NÃO QUEBRAR BACKEND

A refatoração é principalmente visual/UX.

Não alterar:

-   contratos de API;
-   endpoints;
-   regras financeiras;
-   regras de estoque;
-   regras de pedidos;
-   autenticação;
-   autorização;
-   integrações;
-   cálculos;
-   banco de dados;

sem necessidade explícita.

Se uma alteração de UI exigir mudança de lógica, separar claramente a
alteração.

------------------------------------------------------------------------

# 69. REGRA CRÍTICA: NÃO REMOVER FUNCIONALIDADE

Durante a refatoração:

> **Nenhuma funcionalidade existente deve desaparecer.**

Se algo parecer desnecessário visualmente:

-   preservar;
-   reorganizar;
-   simplificar;
-   esconder em menu contextual se adequado.

Nunca apagar por conta própria.

------------------------------------------------------------------------

# 70. REGRA CRÍTICA: NÃO INVENTAR DADOS

Não inventar:

-   métricas;
-   clientes;
-   produtos;
-   pedidos;
-   datas;
-   status;
-   valores.

A interface deve trabalhar com dados reais do sistema.

------------------------------------------------------------------------

# 71. REGRA CRÍTICA: NÃO CRIAR PLACEHOLDERS PERMANENTES

Não deixar:

``` text
Lorem ipsum
Metric 123
Produto teste
Lorem...
```

como conteúdo final.

Se o backend estiver vazio, utilizar Empty State.

------------------------------------------------------------------------

# 72. QUALIDADE DE CÓDIGO

Aplicar:

-   componentes reutilizáveis;
-   tipagem forte quando disponível;
-   nomes semânticos;
-   funções pequenas;
-   responsabilidade única;
-   hooks reutilizáveis;
-   utilitários centralizados;
-   ausência de duplicação;
-   lint;
-   formatter;
-   testes quando já houver infraestrutura.

------------------------------------------------------------------------

# 73. EVITAR OVERENGINEERING

Não criar abstrações gigantes apenas para uma pequena variação.

Regra:

> abstrair padrões repetidos; não abstrair diferenças legítimas.

------------------------------------------------------------------------

# 74. DESIGN SYSTEM DOCUMENTADO

Cada componente importante deve possuir:

-   propósito;
-   props;
-   variantes;
-   estados;
-   exemplos;
-   regras de uso.

Se o projeto possuir Storybook ou ferramenta equivalente, utilizar.

------------------------------------------------------------------------

# 75. QA VISUAL

Após a implementação, comparar todas as páginas.

Checklist:

-   mesma fonte;
-   mesma escala;
-   mesmos espaçamentos;
-   mesmos botões;
-   mesmos ícones;
-   mesmos badges;
-   mesmos filtros;
-   mesmos skeletons;
-   mesmas tabs;
-   mesma scrollbar;
-   mesma animação;
-   mesma hierarquia.

------------------------------------------------------------------------

# 76. ACESSIBILIDADE QA

Testar:

-   TAB;
-   SHIFT + TAB;
-   ENTER;
-   SPACE;
-   ESC;
-   setas em menus;
-   screen reader;
-   zoom 200%;
-   contraste;
-   focus visible.

------------------------------------------------------------------------

# 77. RESPONSIVE QA

Testar no mínimo:

``` text
375px
390px
768px
1024px
1280px
1440px
1920px
```

Verificar:

-   overflow;
-   tabelas;
-   sidebar;
-   topbar;
-   métricas;
-   filtros;
-   tabs;
-   modais;
-   drawers.

------------------------------------------------------------------------

# 78. PERFORMANCE QA

Verificar:

-   renderização inicial;
-   troca de páginas;
-   refresh;
-   auto refresh;
-   filtros;
-   tabelas;
-   animações;
-   uso de memória;
-   requests duplicados.

------------------------------------------------------------------------

# 79. CRITÉRIO DE SUCESSO

A refatoração estará correta quando o usuário puder entrar em qualquer
módulo e perceber imediatamente:

> "Este é o mesmo sistema."

Sem importar se está em:

-   Pedidos;
-   CRM;
-   Catálogo;
-   Afiliados;
-   Faturamento;
-   Estoque;
-   Relatórios;
-   Configurações.

------------------------------------------------------------------------

# 80. IDENTIDADE VISUAL FINAL DESEJADA

A experiência deve transmitir:

**Clean**

**Premium**

**SaaS**

**Confiável**

**Tecnológica**

**Rápida**

**Organizada**

**Minimalista**

**Profissional**

Referência mental:

> "Um produto SaaS moderno, com acabamento de produto premium, mas sem
> exagero visual."

------------------------------------------------------------------------

# 81. CHECKLIST DE IMPLEMENTAÇÃO

-   [ ] Auditar componentes existentes.
-   [ ] Auditar biblioteca de ícones.
-   [ ] Criar tokens.
-   [ ] Padronizar tipografia.
-   [ ] Padronizar espaçamento.
-   [ ] Padronizar radius.
-   [ ] Padronizar sombras.
-   [ ] Padronizar cores semânticas.
-   [ ] Criar sistema de motion.
-   [ ] Refatorar Sidebar.
-   [ ] Refatorar Topbar.
-   [ ] Criar PageHeader.
-   [ ] Criar MetricsRail.
-   [ ] Criar Button.
-   [ ] Criar IconButton.
-   [ ] Criar Tooltip.
-   [ ] Criar Tabs.
-   [ ] Criar Filters.
-   [ ] Criar DateRange.
-   [ ] Criar DataTable.
-   [ ] Criar StatusBadge.
-   [ ] Criar Skeleton.
-   [ ] Criar EmptyState.
-   [ ] Criar ErrorState.
-   [ ] Criar Toast.
-   [ ] Criar Modal.
-   [ ] Criar Drawer.
-   [ ] Padronizar scrollbar.
-   [ ] Padronizar refresh.
-   [ ] Implementar auto refresh sem flicker.
-   [ ] Preservar contexto durante refresh.
-   [ ] Implementar reduced motion.
-   [ ] Revisar acessibilidade.
-   [ ] Revisar responsividade.
-   [ ] Revisar performance.
-   [ ] Aplicar em Pedidos.
-   [ ] Aplicar em CRM.
-   [ ] Aplicar em Catálogo.
-   [ ] Aplicar em Afiliados.
-   [ ] Aplicar nos demais módulos.
-   [ ] Fazer QA visual global.
-   [ ] Fazer QA funcional.
-   [ ] Fazer QA responsive.
-   [ ] Fazer QA accessibility.

------------------------------------------------------------------------

# 82. INSTRUÇÃO FINAL PARA A IA DE DESENVOLVIMENTO

Você deve interpretar este documento como **regra global de UI/UX do HUB
Commerce**.

Antes de escrever código:

1.  inspecione a arquitetura atual;
2.  identifique componentes reutilizáveis;
3.  identifique duplicações;
4.  identifique estilos inconsistentes;
5.  identifique a biblioteca de ícones atual;
6.  identifique o sistema de CSS/Tailwind/styled components utilizado;
7.  identifique o sistema de rotas;
8.  identifique como o carregamento de dados funciona;
9.  identifique como o refresh funciona;
10. identifique os pontos onde o backend fornece dados.

Depois:

1.  crie/ajuste o Design System;
2.  crie os componentes globais;
3.  refatore o AppShell;
4.  implemente MetricsRail;
5.  implemente sistema de filtros;
6.  implemente estados;
7.  aplique aos módulos;
8.  faça QA.

### Não faça uma reescrita destrutiva.

Prefira:

``` text
refactor incremental
+
componentização
+
design tokens
+
reutilização
+
testes
```

em vez de:

``` text
apagar tudo
+
reescrever tudo
```

------------------------------------------------------------------------

# 83. PRIORIDADE DAS DECISÕES

Quando houver conflito, utilizar esta ordem:

``` text
1. Funcionalidade
2. Acessibilidade
3. Usabilidade
4. Consistência
5. Performance
6. Responsividade
7. Estética
8. Efeitos visuais
```

Nunca sacrificar funcionalidade, acessibilidade ou performance para
obter um efeito visual.

------------------------------------------------------------------------

# 84. RESULTADO ESPERADO

Ao finalizar, o HUB Commerce deve possuir uma interface:

-   visualmente uniforme;
-   moderna;
-   premium;
-   clean;
-   responsiva;
-   acessível;
-   performática;
-   escalável;
-   componentizada;
-   com animações consistentes;
-   com feedback claro;
-   com métricas padronizadas;
-   com filtros padronizados;
-   com ícones SVG padronizados;
-   com skeleton padronizado;
-   com refresh padronizado;
-   com tabelas padronizadas;
-   com tabs padronizadas;
-   com tipografia padronizada;
-   com espaçamento padronizado;
-   com comportamento consistente em todos os módulos.

## REGRA DE OURO

> **O usuário não deve perceber que diferentes módulos foram
> desenvolvidos em momentos diferentes ou por componentes diferentes.
> Tudo deve parecer parte de um único produto SaaS premium.**
