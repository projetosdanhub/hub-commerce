# Interações operacionais do painel

Esta regra complementa `05-frontend-react.md`, `06-design-system.md`, `07-payments.md`, `12-ui-ux-seo-and-mobile.md` e `13-ui-agent-playbook.md`. É obrigatória em toda tela administrativa que exiba métricas, dados filtráveis, listas operacionais ou ações financeiras.

## Métricas

- Métricas operacionais usam `MetricCard` dentro de uma rail/grid conectada: ícone translúcido, rótulo, valor, detalhe e definição seguem a composição canônica existente.
- O valor vem de consulta ou cálculo real; enquanto a consulta estiver pendente, usar `Skeleton` que preserve o espaço. Nunca exibir zero, porcentagem ou estimativa como fallback.
- Quando houver mais de uma métrica ou uma definição puder gerar dúvida, expor:
  - botão de ícone para o `MetricDictionaryDialog`;
  - nome da métrica à esquerda e, no detalhe à direita, significado e cálculo;
  - seleção por clique, foco e hover, sem depender somente de hover.
- A personalização usa `MetricPreferencesDialog`: arrastar reordena, controles de teclado movem acima/abaixo e visibilidade é explícita.
- Preferências que alteram a composição de um painel precisam persistir no servidor por usuário e tenant. Não usar `localStorage` nem simular persistência. Ao menos uma métrica deve permanecer visível.

## Listas, tabelas e estados vazios

- Toda região que alterna entre dados, loading, erro ou vazio usa `hub-stable-data-region` ou pattern equivalente com altura mínima de token. A troca de filtro não pode alterar abruptamente a altura do painel (“efeito sanfona”).
- Estado vazio preserva a região, tem ícone semântico, título, explicação do resultado dos filtros e ação real de limpar filtros quando aplicável.
- Tabelas usam wrapper no desktop e cartões/lista própria no mobile. A página não pode ganhar rolagem horizontal global.

## Período e busca

- Período usa `DateRangeFilter` ao lado da busca. Presets mostram somente seu nome: Todo o período, Hoje, Últimos 7 dias, Este mês ou Último mês.
- Somente período personalizado mostra o intervalo resumido em dia/mês/ano.
- Ao selecionar Personalizado, a lista de presets é substituída pelo formulário de datas; ela não pode crescer para baixo mantendo os dois blocos. `Voltar` restaura os presets sem aplicar alteração.
- Busca compacta usa `ExpandableSearch`. A lupa expande o campo com animação útil; depois que um texto é apagado, o campo recolhe após dois segundos sem nova digitação. O comportamento não pode ocultar texto digitado nem impedir teclado.
- Busca e filtro só são renderizados quando alteram uma consulta real. Em Pedidos, busca por número, cliente, e-mail ou CPF deve corresponder ao contrato do endpoint.

## Tooltips e diálogos

- `Tooltip` continua sendo renderizado por portal para evitar clipping, mas o conteúdo portaled deve receber os tokens do painel para preservar contraste e texto visível.
- Todo diálogo controla foco inicial, trap de Tab, Escape, retorno de foco e fechamento fora quando a operação puder ser descartada com segurança.
- Botão de fechar é uma ação compacta, visualmente ancorada no canto superior direito e com rótulo acessível.
- Prévia de arquivo não é lista bruta: imagens recebem thumbnail dentro de uma grade; documentos exibem card com nome, tipo e abertura segura em nova aba.

## Cancelamento e reembolso de pedidos

- Pedido em `A_PAGAR` pode ser cancelado com motivo obrigatório. Pedido que já avançou para pagamento/atendimento não usa ação de cancelamento.
- Pedido pago segue o fluxo: Solicitar reembolso → `EM_ANALISE_REEMBOLSO` → Confirmar reembolso. A transição de estado bloqueia repetição da solicitação ou confirmação.
- Confirmar reembolso exige motivo, modalidade e de um a dois comprovantes. Os arquivos ficam em storage privado e são pré-visualizados apenas por rota administrativa tenant-scoped autorizada.
- `TRANSFERENCIA` representa transferência ou estorno manual já executado e comprovado; o HUB não deve fingir uma transferência bancária sem gateway real.
- `CASHBACK` só pode criar crédito e lançamento de carteira depois do lock da transição de pedido, dentro de transação. Reembolso exige auditoria e idempotência.
- Integração com Stripe, Mercado Pago, Pagar.me ou qualquer gateway continua bloqueada até existir adapter, ambiente sandbox, webhook assinado e `payment_attempt` tenant-scoped conforme `07-payments.md`.
