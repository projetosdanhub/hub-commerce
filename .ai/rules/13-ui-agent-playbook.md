# Playbook de UI para agentes

Este playbook operacionaliza as regras `06-design-system.md` e `12-ui-ux-seo-and-mobile.md`. Ele é obrigatório para qualquer IA que crie ou altere interface React, CSS do painel, vitrine, navegação, formulário, métrica ou estado visual.

Em caso de divergência, a solicitação explícita do responsável, `AGENTS.md` e as regras normativas prevalecem sobre este arquivo.

## Leitura antes de editar

1. Ler `AGENTS.md`, `.ai/README.md`, `.ai/agent-handoff.md` e a tarefa correspondente em `task-board.md`.
2. Para UI, ler também `05-frontend-react.md`, `06-design-system.md` e `12-ui-ux-seo-and-mobile.md`.
3. Mapear rota, contrato de API, tenant, permissão, React Query, mutações e todos os consumidores antes de alterar a tela.
4. Identificar a versão desktop e a experiência mobile própria antes de escrever CSS.

## Sequência de implementação

1. Inventariar os estados reais: carregando, vazio, erro, sucesso, bloqueado, sem permissão e indisponível.
2. Reutilizar primeiro os componentes de `resources/js/Modulos/Admin/DesignSystem`.
3. Criar primitive ou pattern somente quando a solução for compartilhável por mais de uma tela.
4. Usar tokens em `resources/css/tokens.css` e classes do DesignSystem; não aplicar `style` inline ou valores visuais arbitrários.
5. Conectar cada filtro, botão e métrica a uma consulta, rota, permissão ou mutação já existente.
6. Após uma mutação confirmada, invalidar/refazer somente as queries tenant-aware afetadas e mostrar o resultado devolvido pela API.
7. Manter adaptadores de legado apenas enquanto houver consumidores; não duplicar a regra de negócio dentro da nova UI.

## Mapa de componentes obrigatório

| Necessidade | Componente |
|---|---|
| Ação textual | `Button` |
| Ação compacta | `IconButton` com rótulo acessível |
| Navegação por ícone ou vitrine | `IconLink` |
| Filtro real | `FilterButton` e/ou `FilterSelect` |
| Aba e submenu | `SectionTabs` |
| Métrica real | `MetricCard` com tooltip quando a definição não for óbvia |
| Carregamento | `Skeleton` dentro de contêiner que anuncia o estado uma vez |
| Ajuda curta | `Tooltip` |

## Proibições sem exceção aprovada

- Não criar mocks, personas, imagens, contadores, previews, métricas, resultados, notificações ou ações simuladas.
- Não exibir `0`, uma previsão ou um valor substituto enquanto uma consulta ainda não retornou.
- Sem contrato tenant-scoped, mostrar estado indisponível e registrar a dependência no board.
- Não renderizar sino, badge de não lidas ou centro de notificações sem contrato real de leitura, origem e destino autorizado.
- Não usar emojis, SVGs manuais duplicados ou outra biblioteca de ícones além de Lucide React.
- Não introduzir CSS inline, hex, sombra, duração, raio, espaçamento ou z-index arbitrário.
- Não reduzir a tela desktop para “caber” no mobile: usar a composição mobile correspondente.
- Não abrir filtros ou menus sem efeito real, nem mostrar visualizar, editar ou excluir sem rota, autorização e contrato.

## Qualidade visual e acessibilidade

- Painel: desktop-first, superfícies conectadas, dark minimalista sutil e vidro discreto.
- Sidebar: estados expandido/recolhido coerentes; ícones centralizados quando recolhida.
- Cada controle tem hover, `focus-visible`, disabled e loading quando aplicáveis.
- Todo input possui label; todo ícone interativo possui nome acessível e tooltip.
- Diálogos controlam foco, Escape e retorno de foco.
- Não criar rolagem horizontal global. Tabelas recebem wrapper no desktop e alternativa legível no mobile.
- Validar 320 px, 768 px, 1024 px, zoom de 200%, teclado e `prefers-reduced-motion`.

## Entrega e continuidade

1. Revisar o diff procurando dados fictícios, estilos inline, valores arbitrários, contratos inventados e cache sem tenant.
2. Executar a matriz de testes proporcional ao risco em `09-testing-and-quality.md`.
3. Atualizar o item no board sem marcar `[x]` antes de existir evidência verificável.
4. Atualizar `.ai/agent-handoff.md` com branch, escopo, contratos preservados, testes/evidências, riscos e próxima ação única.
