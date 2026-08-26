# Design System: E-commerce Management SaaS

## A. Fundamentos
**Visão do Produto, Público e Contexto de Uso:**
O produto é um SaaS B2B destinado a criação e gestão de lojas virtuais e vendas digitais. Os usuários são lojistas e equipes de operação que utilizam a ferramenta diariamente para controlar pedidos, produtos, estoque, configurações e métricas. A interface deve ser focada na eficiência operacional e na tomada rápida de decisão.

**Princípios de Design (Prioridade):**
1. **Eficiência e Velocidade:** Operações em massa, atalhos acessíveis e leitura rápida (tabular nums).
2. **Clareza e Confiança:** Feedback claro de sistema, sem margem para dúvidas (ex.: status de pagamento).
3. **Controle Operacional:** Densidade adequada da informação e fluxos de navegação sem bloqueios.
4. **Sofisticação e Minimalismo (Pro Max):** Interface clean com toques de modernidade (glassmorphism contido).

**Personalidade:**
Confiável, profissional, ágil e moderna.

**Direção Visual e Harmonia:**
- Eixo da marca em azul claro e azul forte (Brand/Sky e Brand/Primary).
- **O que fazer:** Interfaces limpas, hierarquia por contraste de peso tipográfico, agrupamento por proximidade.
- **O que evitar:** Excesso de glassmorphism, uso exagerado de sombras, degradês chamativos, animações desnecessárias e "cards desconectados" (elementos que parecem flutuar sem contexto). O Glassmorphism fica restrito apenas a elementos sobrepostos como modais, toasts, header sticky e toolbars.

## B. Arquitetura CSS puro

Para garantir escalabilidade e manutenção sem dependência de frameworks, a arquitetura CSS adotará o seguinte padrão:
- `tokens.css`: Variáveis globais do sistema (`:root`).
- `base.css`: Reset, estilos padrões de tags (`body`, `h1`, `p`, `a`).
- `layout.css`: Regras de estrutura (Grid, app shell, header, sidebar).
- `components.css`: Estilos de componentes isolados (botões, inputs, modais).
- `animations.css`: Transições, keyframes e reduced motion.
- `utilities.css`: Classes de utilidade controladas (ex.: `.text-center`, `.d-flex`).

**Regras:**
- Proibido uso de valores "mágicos" arbitrários (ex: `#fff`, `15px`, `0.3s`) dentro de componentes; deve-se usar os tokens `--hub-*`.
- Escopo de classes e modificadores via atributo de dados (ex: `[data-state="active"]` ou `.is-active`).

## C. Tokens completos em CSS
(Consulte o arquivo `tokens.css` criado separadamente com essas variáveis).
As categorias contempladas são:
- **Cores:** Brand, Surface, Foreground, Feedback (Info, Success, Warning, Danger).
- **Tipografia:** Famílias, pesos e escalas.
- **Espaçamento:** Escala base 4px.
- **Bordas e Sombras:** Raios de borda sutis, e elevação por camadas de sombra.
- **Glassmorphism:** Variáveis de blur, background translúcido e bordas de destaque.
- **Motion:** Tempos (fast, slow) e easings.
- **Z-Index:** Padronizados para camadas.

## D. Tipografia
Família preferencial: `Plus Jakarta Sans`. Fontes auxiliares: `Inter`, system-ui.

| Estilo        | Tamanho | Peso      | Line-Height | Uso |
| ------------- | ------- | --------- | ----------- | --- |
| Display       | 2rem/32px | Bold (700) | 1.2 | Destaques grandes, Landing Page |
| H1            | 1.5rem/24px | SemiBold (600) | 1.2 | Título da página principal |
| H2            | 1.25rem/20px | SemiBold (600) | 1.3 | Títulos de seções ou painéis |
| H3            | 1.125rem/18px | SemiBold (600) | 1.3 | Subtítulos |
| Body Large    | 1rem/16px | Medium (500) | 1.5 | Textos principais, ênfase |
| Body          | 0.875rem/14px | Regular (400) | 1.5 | Texto corrido padrão |
| Body Small    | 0.75rem/12px | Regular (400) | 1.5 | Metadados, exceções |
| Button/Label  | 0.875rem/14px | SemiBold (600) | 1.0 | Rótulos de campos e botões |
| Métrica/Valor | 1.5rem/24px | Bold (700) | 1.2 | Valores financeiros e KPIs (tabular-nums) |

## E. Layout, grid e espaçamento
- **Mobile-first:** Início do layout básico expandindo para os demais breakpoints.
- **Breakpoints:** 375px (sm), 640px (md), 768px (lg), 1024px (xl), 1280px (2xl), 1440px (3xl).
- **App Shell:** Sidebar expansível (desktop) / recolhível (tablet) / modal drawer (mobile). Header superior fixo contendo buscas rápidas e perfil.
- **Grid:** 12 colunas no desktop, 8 no tablet, 4 no mobile.
- **Áreas Clicáveis:** Mínimo de 44x44px.
- **Tabelas:** Wrappers de overflow-x com scroll horizontal indicativo (`scrollbar-width: thin`). A rolagem horizontal na *página inteira* é estritamente proibida.

## F. Superfícies e glassmorphism
- **App Shell / Background:** Sólido (`#F8FAFC`).
- **Sidebar & Paineis:** Superfície sólida branca (`#FFFFFF`) com borda muito sutil (`#DCE5F2`) para não depender de sombras densas.
- **Header & Toolbars Persistentes:** Sutil glassmorphism (`backdrop-filter: blur(12px)`) com `background: rgba(255,255,255, 0.85)` e borda inferior.
- **Dropdown/Popover/Modal:** Base branca + `backdrop-filter: blur(16px)` + Sombra `elevation-high`. Fallback para navegadores sem blur será `#FFFFFF` com 100% de opacidade.

## G. Componentes e estados
- **Botões:**
  - Primary: Fundo Brand (`#2563EB`), Texto Branco. Hover: `#1D4ED8`. Active: `#1E40AF`.
  - Secondary/Outline: Fundo transparente, borda Brand, Texto Brand.
  - Ghost: Apenas texto, fundo muda sutilmente no hover.
- **Inputs:** Fundo branco, borda subtil, ring de foco (2px offset).
- **Tabelas:** Linhas zebra opcionais, hover de linha para identificar foco, ações rápidas no final da linha ou via seleção em massa.
- **Badges:** Success (`#15803D`), Warning (`#B45309`), Danger (`#DC2626`), Info (`#0369A1`).

## H. Botões e microinterações
- Clique resulta em `transform: translateY(1px) scale(0.98)` imediato (80ms).
- Hover sutil escurecendo o tom da cor e alterando box-shadow levemente.
- O foco por navegação de teclado usa outline ou box-shadow visível, que não altera o layout real.
- Em estado de loading (carregando), a largura do botão é mantida, o texto pode desaparecer para dar lugar a um spinner, usando `aria-busy="true"`.
- Não utilizar `cursor: pointer` para elementos que não sejam botões interativos ou links.

## I. Motion e transições
| Interação           | Duração | Easing |
| ------------------- | ------- | ------ |
| Hover / Focus       | 150ms   | ease-out |
| Botão Pressionado   | 100ms   | ease-in |
| Dropdown / Popover  | 200ms   | ease-out |
| Modais / Drawer     | 250ms   | cubic-bezier(0.16, 1, 0.3, 1) |
| Entrada de Página   | 200ms   | ease-out (opacity + translateY) |

*Nota:* Suporte global para `@media (prefers-reduced-motion: reduce)` desabilitando transforms e encurtando durações para 0ms ou 1ms.

## J. Ícones SVG e loaders
- **Família:** Phosphor Icons (Outline).
- **Tamanhos:** 16px, 20px, 24px.
- **Regras:** Usar `currentColor` nas tags do SVG. Qualquer ícone ao lado de texto que não acrescente contexto único deve usar `aria-hidden="true"`.
- **Loader:** Spinner clássico, velocidade 800ms linear.

## K. Scrollbar e áreas roláveis
- As scrollbars utilizarão a nova propriedade `scrollbar-color` e `scrollbar-width: thin`.
- Customização para webkit (Chrome/Safari) para alinhar visual (track transparente, thumb da cor do texto mudo / border).
- `scrollbar-gutter: stable` em modais para evitar que o conteúdo "pule" ao exibir a barra.

## L. Carrosséis
- Implementados usando CSS Scroll Snap (`scroll-snap-type: x mandatory`).
- Proibida a rotação automática incondicional.
- Controles de setas e teclado (focus capture) obrigatórios.

## M. Responsividade
- Formulários em grid passam para formato empilhado (1 coluna) no mobile.
- Gráficos e KPIs adaptam e escondem legendas menos relevantes.
- Filtros da tabela mudam para um Off-canvas (Drawer) em telas menores.
- Utilizar `min-width` para todas as media queries para manter abordagem mobile-first.

## N. Acessibilidade e UX
- Garantir proporção de contraste de, no mínimo, 4.5:1.
- Outline claro no focus (`focus-visible`).
- HTML semântico: `button` para ações, `a` para links. `dialog` nativo onde couber.
- Uso correto de ARIA (ex: `aria-expanded` em dropdowns).

## O. Conteúdo, dados e estados
- Moedas são alinhadas à direita (tabular nums).
- Empty states precisam ter ícone, texto explicativo e a principal Call to Action (ex.: "Adicionar Produto").
- Skeleton loading restrito para evitar o layout shift, preferencialmente exibido apenas se a requisição demorar mais de 300ms.

## P. Checklist de qualidade e critérios de aceite
- [ ] Consistência de tokens mantida sem CSS solto.
- [ ] Teste de contraste (WCAG AA).
- [ ] Teste de tabulação por teclado sem travamentos.
- [ ] Touch targets com mínimo de 44px em mobile.
- [ ] Validação de modo de `reduced motion`.
- [ ] Tabelas amplas operáveis no mobile (scroll horizontal do wrapper).
- [ ] Sem quebras visuais em zoom de 200%.

> *Nota: Os scripts do skill "ui-ux-pro-max-skill" não puderam ser executados devido à ausência do interpretador Python na máquina host. As escolhas acima representam um fallback estruturado embasado nos tokens recomendados e melhores práticas UX/UI aplicáveis a este escopo de produto.*
