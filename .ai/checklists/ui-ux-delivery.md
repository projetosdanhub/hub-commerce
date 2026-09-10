# Checklist de entrega UI/UX

## Dados e segurança

- [ ] Contrato real e tenant-aware identificado.
- [ ] Sem mocks, exemplos preenchidos, métricas, imagens, contadores ou notificações simuladas.
- [ ] Mutação atualiza as queries afetadas após resposta da API.
- [ ] Estados loading, vazio, erro, sucesso, bloqueado e sem permissão tratados quando aplicáveis.

## Interface e acessibilidade

- [ ] Tokens, Tailwind v4, Lucide e primitives/patterns canônicos reutilizados.
- [ ] Sem estilos inline, magic values, emojis ou SVG duplicado.
- [ ] Labels, teclado, focus-visible, contraste AA, alvo de 44px e reduced motion verificados.
- [ ] Desktop e mobile possuem comportamento deliberado; sem rolagem horizontal global.
- [ ] Zoom 200% preserva leitura e ações.

## SEO e desempenho

- [ ] Admin permanece noindex.
- [ ] Storefront usa SEO/canonical/schema somente com dados reais do tenant.
- [ ] Imagens possuem alt, dimensão/ratio e carregamento apropriado.
- [ ] Rotas e recursos não críticos são carregados sob demanda quando aplicável.

## Entrega

- [ ] Board e handoff atualizados.
- [ ] Testes proporcionais executados e evidenciados.
- [ ] PR descreve escopo, dados reais, riscos e itens pendentes.
