# Design system e UI/UX

Este arquivo é o contrato técnico de interface. design-system/MASTER.md continua como referência de direção visual; em conflito de implementação, esta regra prevalece até uma ADR reconciliar os documentos.

## Stack canônica

- Tailwind CSS v4 para composição e responsividade.
- CSS custom properties de resources/css/tokens.css para valores semânticos.
- Lucide React como única biblioteca de ícones.
- Framer Motion apenas quando a animação melhora compreensão.
- Proibido introduzir Phosphor, outra biblioteca ou ícones SVG duplicados sem decisão registrada.

## Consistência

- Cores, espaçamentos, raios, sombras, tipografia, motion e z-index vêm de tokens.
- Evitar valores arbitrários como hex, rounded-[...], shadow-[...] e durações soltas.
- Novos padrões reutilizáveis entram em DesignSystem/primitives ou patterns.
- Não declarar blocos style dentro de componentes nem usar dangerouslySetInnerHTML para CSS.
- Uma ação equivalente deve ter o mesmo componente, rótulo, estado e posição em todo o painel.
- Loja pode receber tema do tenant, mas componentes e comportamento permanecem padronizados.

## Acessibilidade

- WCAG 2.2 AA, contraste mínimo 4.5:1.
- Navegação completa por teclado, focus-visible e ordem lógica.
- Touch target mínimo de 44x44px.
- Inputs sempre possuem label; placeholder não substitui rótulo.
- Botão para ação, link para navegação.
- Diálogos controlam foco, Escape e retorno de foco.
- Respeitar prefers-reduced-motion.
- Ícones decorativos usam aria-hidden; botões de ícone usam nome acessível.

## Layout

- Mobile-first e sem rolagem horizontal da página.
- Tabelas largas usam wrapper próprio e alternativa útil no mobile.
- Estados devem preservar layout e evitar mudanças bruscas.
- Painel privilegia densidade operacional; storefront privilegia clareza de compra e desempenho.
- Não carregar recursos externos de demonstração em produção.
