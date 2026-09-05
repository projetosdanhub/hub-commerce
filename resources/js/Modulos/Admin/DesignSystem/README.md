# Design System do painel

Este diretório é a fonte canônica dos controles reutilizáveis do painel administrativo. Antes de criar uma tela ou alterar uma existente, leia `AGENTS.md`, as regras `.ai/rules/05-frontend-react.md`, `.ai/rules/06-design-system.md`, `.ai/rules/12-ui-ux-seo-and-mobile.md` e `.ai/rules/13-ui-agent-playbook.md`.

## Uso obrigatório

| Necessidade | Componente canônico | Regra |
|---|---|---|
| Criar, salvar, atualizar, confirmar, cancelar | `primitives/Button` | Use a variante que corresponde à consequência da ação. |
| Editar, excluir ou outra ação compacta real | `primitives/IconButton` | Sempre exige rótulo acessível, tooltip e ação disponível. |
| Abrir uma rota ou a vitrine | `primitives/IconLink` | Navegação é link, não botão. |
| Filtros e período | `FilterButton` + `FilterSelect` | Só controla consultas que já existem. |
| Métrica operacional | `MetricCard` | Valor deve vir da API ou de cálculo sobre a resposta atual. |
| Carregamento | `Skeleton` | Preserve espaço; anuncie carregamento uma única vez no contêiner. |
| Menu de conteúdo e submenus | `patterns/SectionTabs` | Reutilize para abas de módulo e editor. |
| Ajuda de ícone/métrica | `Tooltip` | Não esconda informação essencial apenas no tooltip. |

## Estados e atualização

Toda tela deve tratar loading, vazio, erro e sucesso no contexto correto. Após salvar, publicar, excluir ou executar uma ação remota, invalide/refaça a query tenant-aware afetada; o feedback de sucesso só ocorre após a confirmação da API.

Ações de visualizar, editar e excluir somente entram na interface quando rota, permissão e contrato reais existem. Centro de notificações permanece bloqueado até existir contrato tenant-scoped; não adicionar sino, badge ou contador de demonstração.

## Desktop e mobile

O painel usa shells independentes. No mobile, filtros podem ser recolhidos, tabelas recebem alternativa legível e controles mantêm alvo mínimo de 44 px. Não criar rolagem horizontal global; valide 320 px, 768 px, 1024 px, teclado, zoom de 200% e `prefers-reduced-motion`.

## Checklist de uma nova tela

1. Mapear contrato, permissões e estados reais.
2. Reutilizar primitives/patterns deste diretório.
3. Usar tokens, sem `style` inline, hex, durações ou sombras arbitrárias.
4. Confirmar que nenhum dado, ação, métrica ou notificação foi simulado.
5. Cobrir comportamento proporcional com testes e registrar a evidência no handoff.


## Atualização, períodos e conteúdo longo

- A atualização manual é global: use `AdminPageRefreshProvider` no shell e `useRegisterAdminPageRefresh` somente para uma tela que precise de uma composição de refetch específica. Não repetir botões “Atualizar dados” em cabeçalhos, abas ou detalhes.
- Para período, use `patterns/DateRangeFilter` ao lado da busca. Ele oferece Todo o período, Hoje, Últimos 7 dias, Este mês, Último mês e Personalizado com intervalo validado. O seletor nativo `FilterSelect` continua reservado a listas simples.
- O submenu de status usa `SectionTabs`; filtros temporais não fazem parte da mesma trilha visual.
- Use `TruncatedText` em colunas, títulos ou identificadores que possam exceder seu contêiner. Preserve o texto completo no tooltip e mantenha o layout sem overflow.
- `Tooltip` é renderizado acima da interface por portal; não criar variações locais que possam ser cortadas por `overflow`, flex ou superfícies.


## Operação: métricas, listas e busca

- Use `hub-stable-data-region` em qualquer área que possa alternar lista, tabela, skeleton ou vazio. O painel mantém altura mínima e o estado vazio fica centralizado, com ícone, título, explicação e ação real.
- `ExpandableSearch` substitui busca sempre aberta quando a densidade operacional pedir um controle compacto. A lupa expande o campo; após apagar uma busca já preenchida, ele recolhe em dois segundos de inatividade.
- `MetricDictionaryDialog` explica métricas com nome à esquerda e definição/cálculo à direita. `MetricPreferencesDialog` permite ordenar por arraste ou teclado e alternar visibilidade, mas sua configuração deve ter endpoint tenant-aware persistido.
- O filtro de período mostra o nome de presets e reserva datas para período personalizado. Em Personalizado, o formulário substitui a lista de opções e `Voltar` restaura os presets.
- Para regras completas, incluindo comprovantes privados e transições de reembolso, consulte `.ai/rules/14-operational-admin-interactions.md`.
