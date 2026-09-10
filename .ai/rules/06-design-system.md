# Design system e UI/UX

Este arquivo é a única regra normativa de layout e interface. Diretrizes antigas, prompts isolados e skills externas de UI não devem ser usados como fonte de verdade.

## Stack canônica

- Tailwind CSS v4 para composição e responsividade.
- CSS custom properties de resources/css/tokens.css para valores semânticos.
- Lucide React como única biblioteca de ícones.
- Framer Motion apenas quando a animação melhora compreensão.
- Proibido introduzir Phosphor, outra biblioteca ou ícones SVG duplicados sem decisão registrada.

## Consistência

- Cores, espaçamentos, raios, sombras, tipografia, motion e z-index vêm de tokens.
- Evitar valores arbitrários como hex, rounded-[...], shadow-[...] e durações soltas.
- Novos padrões reutilizáveis entram em resources/js/Modulos/Admin/DesignSystem/primitives ou patterns.
- Não declarar blocos style dentro de componentes nem usar dangerouslySetInnerHTML para CSS.
- Uma ação equivalente deve ter o mesmo componente, rótulo, estado e posição em todo o painel.
- A Storefront pode receber tema do tenant, mas componentes e comportamento permanecem padronizados.
- Não criar um novo padrão visual quando já existir primitive ou pattern equivalente.
- Toda exceção visual reutilizável deve virar token ou variante documentada.

## Catálogo canônico de primitives e patterns

Use estes componentes em todo novo módulo do painel. Não reimplementar variações locais.

- `Button`: ações textuais reais como criar, salvar, atualizar, confirmar e cancelar; variantes `primary`, `secondary`, `ghost` e `danger`.
- `IconButton`: ações compactas reais, com rótulo acessível, foco e loading; sem tooltip visual. Variantes `neutral`, `primary` e `danger`. Não mostrar visualizar, editar ou excluir se a ação/autoridade correspondente não existir.
- `IconLink`: navegação por ícone; links, inclusive vitrine, não devem ser simulados como botões.
- `FilterButton` e `FilterSelect`: filtros que alteram uma consulta real. Período usa `DateRangeFilter` junto da busca; nenhum controle abre painel vazio ou aplica critérios fictícios.
- `MetricCard`: composição canônica de Pedidos, com ícone translúcido, fontes, escala e espaçamento compartilhados. Definições ficam no dicionário de métricas. Nunca exibir zero enquanto a consulta está pendente.
- `Skeleton`: placeholder silencioso que preserva o layout durante carregamento; o contêiner anuncia o estado uma única vez.
- `SectionTabs`: menu de seções/submenus do conteúdo. As abas mantêm semântica `tablist/tab` e usam o mesmo comportamento no desktop e no mobile.
- `Tooltip`: adaptador legado sem interface; apenas retorna os filhos. Não adicionar novos consumidores. Ajuda é texto contextual ou dicionário explícito; não há tooltip visual.

Detalhes de composição e exemplos de uso estão em `resources/js/Modulos/Admin/DesignSystem/README.md`.

## Acessibilidade

- WCAG 2.2 AA, contraste mínimo 4.5:1.
- Navegação completa por teclado, focus-visible e ordem lógica.
- Touch target mínimo de 44x44px.
- Inputs sempre possuem label; placeholder não substitui rótulo.
- Botão para ação, link para navegação.
- Diálogos controlam foco, Escape e retorno de foco.
- Respeitar prefers-reduced-motion.
- Ícones decorativos usam aria-hidden; botões de ícone usam nome acessível.
- Estados não podem depender somente de cor.

## Layout

- Painel desktop-first com composição mobile própria, sem rolagem horizontal da página; vitrine mantém sua estratégia responsiva.
- Tabelas largas usam wrapper próprio e alternativa útil no mobile.
- Estados devem preservar layout e evitar mudanças bruscas.
- Painel privilegia densidade operacional; Storefront privilegia clareza de compra e desempenho.
- Não carregar recursos externos de demonstração em produção.
- Loading, vazio, erro, sucesso, bloqueado e sem permissão precisam de padrões consistentes.

## Processo para qualquer tela

1. Identificar primitive e pattern existentes.
2. Mapear estados e ações antes de estilizar.
3. Usar tokens e variantes canônicas.
4. Validar desktop, mobile, teclado, zoom 200% e reduced motion.
5. Registrar novo padrão compartilhado quando necessário.
6. Atualizar task-board.md e testes visuais/funcionais aplicáveis.
