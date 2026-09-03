# Hub Commerce - Regras de Layout e Padrões de Interface

Este documento define os padrões visuais (Tailwind CSS) estabelecidos durante a refatoração do módulo de Produtos. Sempre consulte este arquivo antes de criar ou refatorar o layout de outras telas para garantir consistência em toda a aplicação.

## 0. Tipografia (Global)
- **Títulos e Cabeçalhos (`h1`, `h2`, `h3`):** Utilizar a fonte **Outfit** (ou equivalente `font-heading`).
- **Textos e Descrições Gerais:** Utilizar a fonte **Inter** (ou equivalente `font-sans`).
- Menus e abas devem utilizar caixa alta (`uppercase`) com espaçamento estendido (`tracking-wider` ou `tracking-widest`).

### Tipografia de Métricas e Componentes
- **Labels de Métricas e Subtítulos Secundários:** `text-[10px] font-semibold text-slate-400 uppercase tracking-wider` — Sempre alinhados à esquerda. Evite `font-black` para não pesar a interface.
- **Valores Financeiros (R$):** O tamanho de fonte deve ser **responsivo ao valor numérico** para evitar quebra, truncamento ou overflow:
  - Valores >= R$ 100.000: `text-xl`
  - Valores >= R$ 10.000: `text-2xl`
  - Valores < R$ 10.000: `text-[28px]`
  - Classe fixa: `font-black text-slate-900 tracking-tight leading-none`
- **Valores Inteiros (Quantidades):** `text-2xl font-black text-slate-900 tracking-tight leading-none`
- **Badges de Variação (%):** `text-[9px] font-black uppercase tracking-wider` com ícone `w-2.5 h-2.5`

---

## 1. Estrutura de Páginas e Cabeçalhos (Arquitetura Modular)

### Fundo Livre e Cards Independentes (Modular Grid)
O layout do sistema não deve utilizar uma única "caixa de vidro" (monolito) para englobar telas inteiras. O fundo principal da página (do `<main>`) deve ser mantido limpo (ex: `bg-slate-50/50`), e os componentes internos (Dashboards, Tabelas, Cabeçalhos de Navegação) devem ser separados em **Cards Modulares Independentes**. Isso elimina completamente o "efeito sanfona" do Flexbox e resolve problemas crônicos de barras de rolagem aninhadas.

**Classes Base de um Card Modular:**
Cada módulo de conteúdo deve ser empacotado individualmente com o efeito Glassmorphism:
`bg-white/80 backdrop-blur-md border border-slate-200 rounded-[7px] shadow-sm flex flex-col`

### Cabeçalho de Navegação (Card Superior)
O título, ícone principal e as abas de navegação devem residir no seu próprio Card no topo da tela, geralmente com um padding consistente. O fundo deve ter um leve gradiente com efeito glassmorphism para um visual super premium.
- O header (card) superior deve ter margem inferior (`mb-6` ou usando `gap-6` no pai flex) para separá-lo do conteúdo.
- Fundo do Header: `bg-gradient-to-r from-blue-50/40 via-white/40 to-white/80 backdrop-blur-xl`
- Ícone: `w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm border border-blue-100`
- Título: `text-2xl font-black text-slate-900 tracking-tight`
- Subtítulo: `text-sm font-medium text-slate-500 mt-1`

### Subtítulos de Cards Internos
Quando um Card Modular possui um título interno (ex: "Informações Básicas" ou "Grade de Variações"), ele deve seguir o padrão:
- **Classes:** `text-base font-black text-slate-900 tracking-tight mb-4 pb-3 border-b border-slate-100`
- Ele deve ser acompanhado de uma borda inferior para separar visualmente o cabeçalho do card do seu conteúdo.

### Menus de Navegação (Menu Afundado)
O menu de abas deve ficar **abaixo do título**, dentro do Card Superior, com efeito "SaaS Afundado".
- **Container do Menu:** `flex bg-slate-100/60 p-1 rounded-xl border border-slate-200/60 shadow-inner overflow-x-auto w-full sm:w-auto gap-1`
- **Botões Inativos:** `text-slate-500 hover:text-slate-700 hover:bg-slate-200/40 scale-[0.98] hover:scale-100`
- **Botão Ativo:** `bg-white text-slate-900 shadow-sm ring-1 ring-slate-900/5` (Não usar cores fortes como azul no texto da aba ativa).
- **Texto:** `text-xs uppercase font-bold tracking-wider`

---

## 2. Padrões de Conteúdo e Scroll

Como cada bloco de informação (ex: Tabela de Produtos) agora vive no seu próprio Card Modular, as amarras rígidas de altura (`h-full`, `min-h-0`, `overflow-hidden` forçado) devem ser **removidas**.
- O Card da Tabela deve crescer naturalmente para baixo. A página principal (`<main>`) lidará com o scroll vertical nativamente.
- O scroll horizontal (`overflow-x-auto`) deve ser aplicado **apenas ao wrapper interno da tabela** dentro do seu respectivo card para garantir perfeita rolagem de tabelas largas em dispositivos móveis, sem sumir com menus e botões superiores.

---

## 3. Botões e Ações

Os botões devem ter espaçamentos confortáveis e sombras leves, sempre com arredondamento consistente.

### Ações Redundantes (O Que Evitar)
- **Botões de "Atualizar" Locais (RefreshCw):** Não adicionar botões de atualizar dados (como reload de lista ou painel) dentro das páginas. O header global do sistema (`AdminLayout.jsx`) já possui um botão mestre de **Atualizar**.
- **Botões de "Exportar Excel":** Manter a interface focada e minimalista. Botões de exportação local só devem existir se estritamente exigidos pelo requisito da página.

### Efeito Glassmorphism (Cartões de Métricas)
- **Cartões de Valores/Métricas:** Devem utilizar transparência e blur (ex: `bg-white/60 backdrop-blur-sm`).
- **Atenção ao Z-Index (Stacking Context):** Elementos com `backdrop-blur` criam um novo contexto de empilhamento no navegador. Se um Popover ou Dropdown (ex: Calendário) for sobrepor a área de glassmorphism, o container pai do dropdown (como o `<header>`) deve obrigatoriamente possuir um `z-index` bem alto (ex: `relative z-50`), e a área com o blur deve receber um z-index base (ex: `relative z-10`) para não renderizar por cima do dropdown.
- **Métricas Financeiras Destacadas:** Adicionar gradiente extremamente suave. Ex: `bg-gradient-to-br from-white/80 to-blue-50/30`.

### Botões de Filtro e Selects (Ex: Período, Exibir)
- **Filtros (Padrão AnimatedFilterIcon):** Substituem selects tradicionais. Quando inativos, mostram apenas ícone e label interno. Expandem suavemente usando `framer-motion` (`w-[42px]` para `w-auto`). O botão base utiliza `flex items-center h-full overflow-hidden rounded-xl border transition-colors duration-200 shadow-sm bg-white border-slate-200`. Quando ativado (`isActive`), ganham `ring-4 ring-blue-500/10 border-blue-300` e o texto do filtro ativo é exibido ao lado do ícone, economizando espaço de tela e garantindo um visual *Premium*.
- **Botão de Período Padrão (Calendário):** O texto padrão quando nenhum período estiver ativado deve ser **"Últimos 30 Dias"** (e não apenas "Período").
  - **Estado Inativo (Padrão 30 Dias):** O botão deve possuir estado inativo (fundo branco, borda cinza) para indicar o período padrão. Ele **NÃO** deve parecer que está filtrando (não deve ter fundo azul ou anel de foco) quando estiver no modo "Últimos 30 Dias".
  - O popover do calendário deve possuir dois botões no rodapé: **"Últimos 30d"** (que define as datas automaticamente para os últimos 30 dias e remove o estado de filtro) e **"Confirmar"**.
  - Classes Inativo: `flex items-center gap-2 px-4 h-10 rounded-xl text-sm font-semibold border transition-all duration-200 shadow-sm bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300`
  - Classes Ativo (Apenas ao aplicar data customizada): `bg-blue-50 border-blue-200 text-blue-700 ring-4 ring-blue-500/10`

### Empty States (Listagens Vazias)
- **Padrão Visual:** Container simples centralizado com ícone ilustrativo (`w-16 h-16 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center`), Título e Parágrafo curto de orientação.
- **Ações:** Evitar a inclusão de botões de ação ("Limpar Filtros" ou "Novo Cadastro") no próprio estado vazio para manter a interface o mais limpa e focada possível.

### Botões de Ação Principal (Ex: Novo Produto, Salvar, Publicar)
- **Primary / Ação Principal (Azul Marinho Glassmorphism):** Adicionar efeito de vidro e gradiente sutil.
- **Classes Base:** `bg-gradient-to-r from-slate-900 to-slate-800 text-white font-bold text-sm rounded-xl px-5 py-2.5 transition-all shadow-sm border border-slate-700/50 hover:from-slate-800 hover:to-slate-700 hover:shadow-md hover:ring-4 hover:ring-slate-900/20 backdrop-blur-sm`

### Botões de Adicionar Redondos (Variações, Atributos - Glassmorphism)
Em vez de botões retangulares para adicionar novos itens nas abas, utilizar um botão redondo com ícone que rotaciona. **Importante:** Ações de adicionar (que mexem com array local) devem ter um delay artificial (ex: 400ms) simulando carregamento (`isAdding`) para humanizar a interface.
- **Classes Base:** `group w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-sm hover:shadow-md transition-all duration-300 border border-slate-700/50 backdrop-blur-sm hover:ring-4 hover:ring-slate-900/20 disabled:opacity-50`
- **Ícone (Estado Normal):** `<Icons.Plus className="w-5 h-5 transition-transform duration-500 group-hover:rotate-180" />`
- **Ícone (Carregando):** `<Icons.Loader2 className="w-5 h-5 animate-spin" />`


### Botões de Ação em Tabelas/Listas (Ex: Editar, Duplicar, Remover Item)
- **Padrão Redondo com Ícone (Efeito Brilho/Glow):** Substituir botões sem fundo por botões circulares estruturados simulando um botão físico, que "ascendem" (brilho suave, mudança de borda e sombra colorida) ao passar o mouse.
- **Remoção Local (Ex: Remover Variação/Atributo):** Usar um delay artificial de 400ms (ex: `removingIndex === index`) simulando carregamento antes da exclusão local.
- **Classes Base (Remover Linha Local):** `w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 border border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all duration-200 shadow-sm ml-auto disabled:opacity-50`
- **Classes Base (Editar - Azul):** `w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 border border-slate-200 text-slate-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 hover:shadow-[0_0_12px_rgba(37,99,235,0.2)] transition-all duration-300 shadow-sm`
- **Classes Duplicar (Verde):** Igual acima, alterando os hovers para `hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 hover:shadow-[0_0_12px_rgba(16,185,129,0.2)]`.
- **Ícones:** 
  - **NÃO usar ícone de mais (+)** para ações de Editar. O ícone de "+" deve ser exclusivo para ações de "Adicionar" ou "Novo". Utilizar ícones que remetam especificamente à edição, ajuste ou escrita (Ex: `Pen`, `SlidersHorizontal`, `Settings2`).
  - **Duplicar:** Utilizar o ícone `Copy`.

### Botão de Ação Destrutivo Animado e Modal de Exclusão (Ex: Excluir Produto)
Botões de exclusão ou ações destrutivas severas globais devem seguir dois passos:
1. **O Botão em si:** Deve começar como um ícone sutil, e se expandir no hover para revelar o texto, além de animar o ícone (Ex: Lixeira chacoalhando).
   - **Estrutura base:** `<button className="group flex items-center h-10 overflow-hidden rounded-xl border transition-all duration-300 ease-in-out shadow-sm bg-white border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 disabled:opacity-50 w-10 hover:w-36 relative">`
   - **Ícone:** Envolvido num contêiner fixo (`w-10 h-10 flex-shrink-0`), com classe `group-hover:animate-shake` no `<Icons.Trash>`.
   - **Texto:** `<span className="whitespace-nowrap font-bold text-sm">Excluir</span>` ao lado do ícone.
2. **Confirmação (Modal Obrigatória):** **NUNCA** usar `window.confirm` para alertas, confirmações genéricas ou exclusões. Sempre utilize o componente `<Modal>` padronizado do sistema.
   - O `<Modal>` deve utilizar internamente `AnimatePresence` do `framer-motion` para ter animações suaves de entrada (scale/fade-in) e também obrigatoriamente de **saída (exit={...})** ao ser fechado, seja clicando em cancelar, voltar, ou clicando no overlay externo.
   - Para exclusões de registros: O modal deve conter avisos importantes, um campo de "Motivo da Exclusão" (quando aplicável) e um botão vermelho de Confirmar com loading de rede.
   - Para voltar sem salvar: Um modal estilizado (com notificação visual) avisando sobre a perda de dados, com botões de Continuar Editando e Sair sem Salvar.

### Documentação em Tela (Tutoriais e Tooltips)
Sempre que um componente existir na tela e precisar de explicação, utilize este padrão:
- **Botão Tutorial de Aba/Sessão:** Localizado no cabeçalho do Card (próximo ao título), usando `<BookMarked size={14} /> Tutorial`. Classes: `flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1.5 rounded-lg hover:bg-blue-100 transition-colors`. Ao clicar, deve abrir um `TutorialCatalogModal` (Split View).
- **Tooltips para Labels/Campos (SafeTooltip):** Para esclarecer campos curtos (ex: NCM, Cubagem), coloque `<HelpCircle className="w-3.5 h-3.5 text-slate-400 hover:text-blue-500 cursor-help outline-none" />` englobado pelo `<SafeTooltip>` escuro (padrão `bg-slate-900 text-white`) ao lado da label do campo.

---

## 4. Tabelas e Listagens

### Cabeçalho da Tabela (`thead`)
Os títulos das colunas devem ser bem alinhados e espaçados de forma **harmônica e calculada** para não espremer os dados.
- **Classes Padrão:** `bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold tracking-wider`
- **Larguras de Coluna (Harmonia e Espaçamento):** Não utilizar larguras hardcoded extremas (como `w-[140px]`). Deve-se utilizar `min-w-[150px]` ou `min-w-[200px]` para colunas normais (ex: Data/Hora, Usuário, Ação, Recurso) garantindo um espaçamento respirável. A coluna principal ou de maior texto (ex: Detalhes ou Produto) deve receber `w-full` para consumir todo o espaço flexível restante.
- **Alinhamento Padrão Global:** O padrão do sistema é **texto alinhado à esquerda (`text-left`)** para facilitar a leitura contínua. Colunas curtas ou de ícones podem ser centralizadas (`text-center`). Colunas de valores monetários devem ser alinhadas à direita (`text-right`).
- **Alinhamento Estrito:** A informação da linha (`td`) **deve obrigatoriamente** acompanhar o alinhamento do subtítulo (`th`).

### Linhas da Tabela (`tbody > tr`)
- **Fundo Padrão:** `bg-white` (Para dar contraste caso o container principal possua partes em cinza).
- **Classes da Linha:** `border-b border-slate-100 hover:bg-slate-50 transition-colors duration-150 cursor-pointer`
- **Separação Visual:** Cada linha DEVE ter `border-b border-slate-100` para separar visualmente os itens. Sem isso, as linhas ficam "grudadas" e perdem legibilidade.
- **Hover:** Destaque sutil com `hover:bg-slate-50` (fundo inteiro da linha). **NÃO** usar barras verticais laterais (`border-left`, `border-l-blue-600`) nem indicadores de borda lateral como destaque de hover. O hover deve ser exclusivamente por fundo.
- **Clicabilidade:** Todas as linhas devem ter `cursor-pointer` e uma `transition-colors duration-150` para feedback visual suave.

### Distribuição Proporcional de Colunas (Tabelas de Auditoria / Logs)
Tabelas com múltiplas colunas de contexto (Data, Usuário, Ação, Recurso, Detalhes) **devem usar larguras proporcionais calculadas** via `style={{ width: 'X%' }}` para garantir distribuição harmônica. As colunas **não devem ficar empurradas para o canto** com `min-w` solto.

**Distribuição Padrão para Tabelas de Auditoria:**
| Coluna | Largura | Alinhamento |
|---|---|---|
| Data / Hora | `15%` | `text-left` |
| Usuário / Ator | `18%` | `text-left` |
| Ação | `10%` | `text-left` |
| Recurso | `20%` | `text-left` |
| Detalhes | `37%` | `text-left` |

- **Detalhes** deve usar `break-words leading-relaxed` (sem `whitespace-nowrap` nem `max-w-[300px]`) para que textos longos de auditoria (diffs) possam quebrar naturalmente em múltiplas linhas sem truncar.
- **Recurso** deve usar `truncate` para não ultrapassar sua coluna.
- Todas as colunas devem ser `text-left` — incluindo Data/Hora. **NÃO** centralizar Data/Hora.
- A tabela mínima deve ser `min-w-[960px]` para garantir espaço suficiente em telas menores.

**Distribuição Padrão para Tabelas de Produtos:**
| Coluna | Largura | Alinhamento |
|---|---|---|
| Produto & SKU | `28%` | `text-left` |
| Categoria | `15%` | `text-center` |
| Preço | `12%` | `text-right` |
| Status | `10%` | `text-center` |
| Vendidos | `10%` | `text-center` |
| Estoque | `13%` | `text-center` |
| Ações | `12%` | `text-center` |

- **Produto & SKU** é a coluna principal e recebe a maior fatia (28%) para exibir imagem + nome + SKU sem truncar.
- **Preço** deve ser `text-right` para alinhar decimais corretamente.
- Colunas compactas (Status, Vendidos) recebem `10%` — suficiente para badges e valores curtos.
- A tabela mínima deve ser `min-w-[960px]`.

### Badges e Status
Utilizar cores suaves com bordas para exibir status (padrão pílula). Para categorias ou elementos de metadados, evitar fundos muito escuros e fontes super pesadas (`font-black`), priorize fundos pastéis (`bg-slate-50`), bordas, e fontes suaves (`font-semibold`).
- **Classes Base Status:** `px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border`
- **Classes Base Categorias / Metadados:** `px-2.5 py-1 rounded-md text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 shadow-sm`
- **Sucesso (Criação/Ativo):** `bg-emerald-50 text-emerald-600 border-emerald-200`
- **Alerta (Oculto):** `bg-amber-50 text-amber-600 border-amber-200`
- **Erro (Exclusão/Esgotado):** `bg-rose-50 text-rose-600 border-rose-200`
- **Informativo (Geral):** `bg-blue-50 text-blue-600 border-blue-200`
- **Neutro (Sistema/Inativo):** `bg-slate-100 text-slate-700 border-slate-200`
- **Especial (Encomenda):** `bg-purple-50 text-purple-600 border-purple-200`

---

## 5. Métricas (Dashboard)

### Layout e Divisores
- As métricas ficam dentro de um `flex` horizontal com `divide-x divide-slate-200/60` para criar divisores verticais entre elas automaticamente via Tailwind.
- **NÃO** usar `border-r border-slate-100/50` manual — usar `divide-x` no pai.
- Cada métrica: `flex-1 min-w-[140px] px-6 py-5 flex flex-col justify-center` (alinhado à esquerda, não centralizado).

### Hover nos Cards de Métricas
- Cada métrica deve ter efeitos de hover suaves:
  - Métricas financeiras (Receita, Lucro): `hover:from-blue-50/40 hover:to-blue-50/50` ou equivalente com gradiente.
  - Métricas numéricas (Catálogo, Vendidos): `hover:bg-slate-50/60`
  - Esgotados: `hover:bg-rose-50/40`
  - Texto do valor no hover: `group-hover:text-blue-700` (ou `text-emerald-700` / `text-rose-600` conforme tipo).
- Usar `group cursor-default transition-all duration-300` na div da métrica.

### Alinhamento
- Labels e valores devem ser alinhados à **esquerda**, não centralizados. Isso evita que números grandes fiquem desalinhados e melhora a leitura.
- `items-center justify-center text-center` **NÃO** deve ser utilizado em métricas. Usar apenas `justify-center` (vertical) sem `items-center` nem `text-center`.

---

## 6. Paginação e Rodapés
Sempre que aplicável, o rodapé de paginação da tabela deve possuir z-index relativo e completar as bordas inferiores do card.
- **Container do Rodapé:** `p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between md:justify-end gap-4 relative z-10 rounded-b-[7px]`
- **Texto Indicativo da Página:** `text-xs font-bold text-slate-400 uppercase tracking-wider hidden md:block`
- **Botões (Anterior/Próxima):** `flex-1 md:flex-none flex items-center justify-center gap-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed`

---

## 7. Mapeamento de Dados Backend <-> Frontend (Convenção Crítica)

### Regra de Nomenclatura
O banco de dados e a API Laravel enviam todos os campos em **snake_case** (ex: `sku_ref`, `status_vitrine`, `quantidade_estoque`, `controlar_estoque`, `pre_venda`, `preco_promo`, `categorias_secundarias`).

O frontend React mapeia essas propriedades para **camelCase** somente dentro do `onEditProduct()` no `ProdutosPrincipal.jsx`. Em tabelas de listagem e dashboards, os dados devem ser acessados diretamente em **snake_case** conforme vêm da API.

### Campos Críticos (Snake_case da API)
| Campo API               | Uso Frontend Direto     | Descrição                              |
|--------------------------|------------------------|----------------------------------------|
| `status_vitrine`         | `p.status_vitrine`     | Status de exibição (ATIVO/INATIVO/OCULTO) |
| `sku_ref`                | `p.sku_ref`            | Referência do SKU                      |
| `sku_sufixo`             | `p.sku_sufixo`         | Sufixo do SKU                          |
| `quantidade_estoque`     | `p.quantidade_estoque` | Quantidade em estoque                  |
| `controlar_estoque`      | `p.controlar_estoque`  | Boolean controle de estoque            |
| `pre_venda`              | `p.pre_venda`          | Boolean pré-venda/encomenda            |
| `preco_promo`            | `p.preco_promo`        | Preço promocional                      |
| `categorias_secundarias` | `p.categorias_secundarias` | Array/JSON de categorias extras    |
| `categoria?.nome`        | `p.categoria?.nome`    | Nome da categoria principal (via relation) |

### Salvamento de Status (EditorDeProduto)
O status deve ser salvo **exatamente como o usuário selecionou**, sem nenhuma lógica de override automático:
```javascript
payload.append('status_vitrine', produtoEmEdicao.status || 'ATIVO');
```
**NÃO** fazer lógica de fallback para `INATIVO` baseada em estoque. Se o usuário quer ATIVO, salva ATIVO.

---

## 8. Auditoria (Detalhes Granulares)

### Regra: Detalhes Nunca Genéricos
A coluna "Detalhes" na auditoria **NUNCA** deve mostrar mensagens genéricas como "Produto atualizado." Toda atualização deve listar exatamente **quais campos mudaram** no formato:
```
Nome: Produto A -> Produto B | Preço: R$ 29,90 -> R$ 39,90 | Status: ATIVO -> INATIVO
```

### Formato
- Separador entre campos: ` | ` (pipe com espaços).
- Formato de cada campo: `{Label}: {valor anterior} -> {valor novo}`.
- Valores monetários formatados: `R$ 29,90`.
- Booleanos formatados: `Sim` / `Não`.
- Para criações: incluir dados principais (Nome, Preço, Status).

### Backend (AdminProductController)
Os valores antigos devem ser capturados **ANTES** do `$produto->update($dados)`. Após o update, os valores de `$produto->campo` já refletem o novo estado, impossibilitando a comparação.

---

## 9. Catálogos e Filtros Avançados

### Catálogo de Métricas (Dicionário de Dados / Split View)
Quando for necessário exibir um catálogo de métricas, dicionário de dados ou lista explicativa de recursos, utilize o padrão "Split View Modal" (Modal Dividida):
- **Lado Esquerdo (Navegação):** Lista de itens (métricas) agrupadas. Ao passar o mouse (`onMouseEnter`) sobre um item, ele se torna o item ativo.
- **Lado Direito (Detalhes):** Uma área dedicada (ex: `bg-slate-50`) usando `AnimatePresence` e `framer-motion` para exibir os detalhes do item focado.
- **Estrutura dos Detalhes:** Deve exibir o Ícone, Título da métrica, Descrição completa e, se aplicável, o **Cálculo Interno / Fórmula** destacado em um bloco específico (ex: `bg-blue-50 border border-blue-200` com fonte monospace `font-mono text-blue-900`).
- Se nenhum item estiver focado, exiba um *Empty State* amigável no lado direito, instruindo o usuário a passar o mouse sobre os itens.

### Filtro de Métricas e Eventos Ativos
Para permitir que o usuário personalize quais métricas ou eventos deseja visualizar (como customizar colunas de uma tabela ou cartões de um dashboard):
- **Ação:** Utilizar um botão com ícone de configuração (ex: `<Settings2 />`) e o texto "Métricas e Eventos Ativos".
- **Comportamento:** Abrir uma modal ou painel contendo Toggles (interruptores) para ativar ou desativar cada métrica de forma individual.
- **Controles em Massa:** Deve conter botões para ações rápidas como "Ligar Todos" ou "Desligar Todos".
- Esse padrão dá autonomia ao usuário e mantém as telas limpas, mostrando apenas o que é relevante para o rastreio ou análise dele.
