# UI/UX, SEO, desempenho e mobile

Esta regra complementa `05-frontend-react.md` e `06-design-system.md`. É obrigatória para qualquer tela do admin, da vitrine ou componente compartilhado.

## Fonte de verdade e dados reais

- Antes de estilizar, identificar contrato, escopo tenant, cache React Query, permissões e todos os estados de dados.
- Nunca usar mocks, números, pessoas, produtos, imagens, badges, contadores ou previsões simuladas no caminho de produção.
- Sem contrato real tenant-scoped, renderizar estado indisponível e registrar a dependência no `task-board.md`; não criar endpoint, contagem ou ação fictícia.
- Após salvar, publicar, excluir ou executar ação que muda dados remotos, invalidar/refetch da key tenant-aware afetada e apresentar o resultado real da API.
- Não exibir sucesso antes de a operação persistir. Erros devem orientar a próxima ação sem expor dados sensíveis.

## Direção visual do HUB Commerce

- Manter Tailwind v4 e tokens em `resources/css/tokens.css`; componentes reutilizáveis pertencem ao DesignSystem.
- Painel: desktop-first, temas escuro minimalista e claro com azul-marinho, vidro discreto, superfícies conectadas e densidade operacional. A preferência de aparência pode persistir localmente, sem dados de negócio; não muda a vitrine. Evitar cards isolados sem relação visual.
- Storefront: clareza de compra, contraste, hierarquia e desempenho; o tema vem do tenant, mas o comportamento canônico permanece.
- Usar Lucide React. Sem emojis, bibliotecas paralelas de ícones ou SVG manual duplicado.
- Sidebar deve ser harmoniosa e recolhível; scrollbars são finas e controles têm estados hover, focus-visible, loading e disabled.
- Tipografia, espaçamento, raios, sombras, cores, motion e z-index usam tokens. Não introduzir magic values ou `style` inline.
- Animação é sutil, rápida e útil para orientação. Respeitar `prefers-reduced-motion`; nunca atrasar ação, leitura ou dado real.

## UX, acessibilidade e feedback

- Cada tela declara loading, vazio, erro, sucesso, bloqueado, sem permissão e indisponível quando aplicáveis.
- Label não pode depender de placeholder. Ícone de ação precisa de nome acessível; cor nunca é o único indicador.
- Fluxos de criação, publicação e exclusão mostram feedback acessível no contexto da ação e atualizam os dados após confirmação da API.
- Toast é apenas feedback efêmero de ação concluída/falha. Não deve representar notificação persistente nem substituir mensagem de validação do campo.
- Centro de notificações só pode existir com contrato tenant-scoped que exponha id, data, origem, título, conteúdo seguro, estado de leitura e destino autorizado. Badge de não lidas vem do backend; sem esse contrato, não renderizar sino ou contador simulado.
- Diálogos destrutivos confirmam consequência, preservam foco e possuem Escape/retorno de foco.

## Mobile separado do desktop

- O admin usa shells desktop e mobile independentes; não reduzir uma tela desktop até caber.
- Em cada mudança, definir o comportamento mobile: navegação, ordem de conteúdo, ações fixas, filtros, tabelas, formulários e detalhe.
- Não existir rolagem horizontal global. Tabelas largas recebem wrapper próprio e uma alternativa mobile legível.
- Validar 320px, 768px, 1024px, zoom de 200%, teclado e leitor de tela. Touch targets têm no mínimo 44x44px.

## SEO e desempenho

- O painel administrativo é `noindex`; não misturar seus endpoints, dados ou meta tags com a vitrine.
- A vitrine usa somente domínio canônico do tenant, title/description reais, Open Graph, canonical, robots e JSON-LD válidos quando os dados existirem.
- Nunca gerar schema, preço, estoque, avaliação, breadcrumb ou imagem de SEO com fallback inventado.
- Carregar imagens reais com dimensão/ratio, `alt` contextual, `srcset/sizes` quando disponível e lazy loading fora do conteúdo crítico.
- Evitar fontes e scripts externos não essenciais. Lazy-load de rotas, divisão de bundle e cache tenant-aware são obrigatórios quando reduzem trabalho perceptível.
- Não medir nem alegar Core Web Vitals sem evidência; registrar a ferramenta, ambiente e resultado.

## Protocolo para outra IA

1. Ler `AGENTS.md`, `.ai/README.md`, as regras 05, 06 e este arquivo, o handoff e a tarefa no board.
2. Mapear contrato real, consumidores, estados, desktop/mobile, SEO quando storefront e critérios de aceite.
3. Reutilizar primitives/patterns existentes; criar novo padrão somente quando for compartilhável.
4. Implementar de forma incremental, sem alterar regra de negócio não relacionada.
5. Executar a matriz de testes proporcional ao impacto, registrar evidências e atualizar handoff/board.
