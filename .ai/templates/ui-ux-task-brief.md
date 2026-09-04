# Brief padrão para uma IA — UI/UX do HUB Commerce

Copie este modelo antes de delegar uma tela ou componente.

## Escopo autorizado

- Tarefa do board:
- Módulo/rota:
- Objetivo do usuário:
- Desktop:
- Mobile (comportamento próprio):
- Storefront/SEO, se aplicável:
- Contratos e endpoints reais:
- Permissões/tenant:
- Estados obrigatórios:
- Fora de escopo:

## Instruções obrigatórias

1. Leia `AGENTS.md`, `.ai/README.md`, `.ai/rules/05-frontend-react.md`, `.ai/rules/06-design-system.md`, `.ai/rules/12-ui-ux-seo-and-mobile.md`, o handoff e a tarefa do board antes de editar.
2. Preserve contratos, autorização e isolamento por tenant. Não invente endpoint, payload, métrica, contador, pessoa, produto, imagem, SKU, estoque, notificação ou integração.
3. Use Tailwind v4, tokens, Lucide e primitives/patterns canônicos. Não usar emoji, SVG manual duplicado, estilos inline, magic values ou `dangerouslySetInnerHTML`.
4. Painel: dark minimalista sutil, vidro discreto, superfícies conectadas, sidebar harmoniosa e dados atualizados após navegação/salvamento/publicação.
5. Mobile não é desktop comprimido: descreva e implemente navegação, ações, filtros, tabelas e formulários próprios.
6. Sem contrato de notificação persistente, não desenhe sino, badge ou feed falso. Use apenas feedback contextual de uma ação real.
7. Storefront: `noindex` nunca se aplica; implementar SEO somente com dados reais do tenant. Admin: `noindex`.
8. Entregue estados loading/vazio/erro/sucesso/bloqueado quando aplicáveis, acessibilidade por teclado e `prefers-reduced-motion`.
9. Atualize cache React Query após mutação e não anuncie sucesso antes da resposta da API.
10. Atualize board e handoff com evidências. Abra PR e execute somente os checks proporcionais ao impacto.

## Saída esperada

- Plano curto.
- Arquivos e contratos afetados.
- Estados e comportamento desktop/mobile.
- Riscos e dependências ausentes.
- Testes executados e links.
- O que ficou explicitamente pendente.
