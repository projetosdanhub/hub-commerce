# Interações operacionais do painel

Esta regra complementa `05-frontend-react.md`, `06-design-system.md`, `07-payments.md`, `12-ui-ux-seo-and-mobile.md` e `13-ui-agent-playbook.md`. É obrigatória em toda tela administrativa que exiba métricas, dados filtráveis, listas operacionais ou ações financeiras.

## Métricas

- Métricas operacionais usam `MetricCard` dentro de uma rail/grid conectada: ícone translúcido, rótulo, valor, detalhe e definição seguem a composição canônica existente.
- O valor vem de consulta ou cálculo real; enquanto a consulta estiver pendente, usar `Skeleton` que preserve o espaço. Nunca exibir zero, porcentagem ou estimativa como fallback.
- Quando houver mais de uma métrica ou uma definição puder gerar dúvida, expor:
  - botão de ícone para o `MetricDictionaryDialog`;
  - nome da métrica à esquerda e, no detalhe à direita, significado e cálculo;
  - seleção explícita por clique ou teclado, sem troca involuntária ao mover o cursor.
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
- Digitação atualiza o campo imediatamente; a consulta aguarda 350 ms sem nova digitação com `useDebouncedValue`. Cancelar o timer anterior ao digitar de novo ou desmontar. Não executar uma query por tecla e não duplicar debounce em duas camadas.
- A busca expansível não recebe contorno marcado: superfície e cor indicam foco; preservar indicação visível de teclado, espaçamento interno entre ícone/texto e controles acessíveis.

## Tooltips e diálogos

- Tooltips visuais foram removidos. O adaptador `Tooltip` retorna apenas filhos para preservar imports existentes; não acrescentar portal, wrapper ou evento. Ajuda fica no contexto ou no dicionário de métricas.
- Todo diálogo controla foco inicial, trap de Tab, Escape, retorno de foco e fechamento fora quando a operação puder ser descartada com segurança.
- Botão de fechar é uma ação compacta, visualmente ancorada no canto superior direito e com rótulo acessível.
- Usar `useDialogLifecycle` para bloquear o scroll do documento e da sidebar enquanto houver modal aberto, inclusive sobreposição de diálogos. Liberar somente após fechar o último modal e restaurar o foco sem deslocar a página.
- Backdrop é vidro translúcido com blur moderado, não bloco preto opaco. Entrada de 200 ms e saída de 120 ms usam tokens; respeitar `prefers-reduced-motion`. Fechar, Voltar e Escape compartilham a saída. Mutações pendentes não podem ser descartadas silenciosamente.
- Métricas preservam altura mínima da região, ícones translúcidos, tipografia e espaçamento de Pedidos. Dicionário e organização possuem composição mobile própria e foco por teclado.

## Escopo operacional aprovado para os próximos blocos

- Reembolso: em análise, ocultar Solicitar e oferecer Cancelar reembolso. Cancelar deve restaurar o estado anterior persistido, sob lock e auditoria; não escolher um status arbitrário. Confirmar exige motivo, escolha explícita de TRANSFERENCIA ou CASHBACK e 1–2 imagens válidas, higienizadas no servidor e privadas, com preview/download autorizado.
- Estoque pós-reembolso: pedido já entregue nunca retorna automaticamente ao estoque vendável. Após o recebimento físico, cada item/variante devolvido deve entrar em estoque de reembolso (quarentena) tenant-scoped, com movimento idempotente e auditado. O módulo futuro de estoque decide por transferência explícita ao estoque normal ou baixa definitiva; reembolso financeiro sem retorno físico não cria saldo.
- Personalização: agrupar anexos e textos por item, SKU e variação, mantendo a tag Personalizado. Preservar arquivo original e resolução para download autorizado, sem misturar imagens de itens diferentes ou transformar thumbnail no original. O frontend só pode renderizar mídia recebida no contrato seguro `{ media: [{ name, preview_url, download_url }] }`, cujas URLs são temporárias e tenant-scoped; URL, data URI ou caminho legado dentro do JSON de personalização não é mídia autorizada.
- Documentos: listar arquivos reais de pagamento, entrega/romaneio, reembolso, declaração, XML e DANFE. Estado vazio só aparece quando não existem documentos. Nenhum espelho HTML deve ser anunciado como NF-e emitida.
- Totais: expor subtotal, bruto, descontos por origem/destino, frete cobrado/custo e líquido conforme contrato. Cupom antecede VIP; benefícios de frete/produto possuem limites separados e não se transferem entre bases. Não inferir lucro ou custo inexistente. Detalhamento exige snapshot financeiro persistido e cálculo em centavos/decimal no servidor.
- Cliente: consumir perfil autorizado compatível com CRM (contato, endereço e benefícios pertinentes); não expor dados de outros tenants ou campos internos.
- Pagamento: ícone semântico antes do método, bandeira somente quando houver metadado confirmado do pagamento. Não inferir bandeira nem expor PAN/CVV.
- Fiscal: preparar configuração em Configurações > Fiscal, certificado/credenciais criptografados por tenant, validade e capacidade de assinatura verificadas no backend. Emissão exige cadastro fiscal dos itens, adapter real e homologação; consultar `docs/architecture/orders-fiscal-readiness.md`.
- Navegação: padronizar entrada/saída, Voltar, fechar e progresso de status com tokens de motion e reduced motion, preservando estado real. Todos os blocos incluem versão mobile separada e ambos os temas.
- Prévia de arquivo não é lista bruta: imagens recebem thumbnail dentro de uma grade; documentos exibem card com nome, tipo e abertura segura em nova aba.

## Cancelamento e reembolso de pedidos

- Pedido em `A_PAGAR` pode ser cancelado com motivo obrigatório. Pedido que já avançou para pagamento/atendimento não usa ação de cancelamento.
- Pedido pago segue o fluxo: Solicitar reembolso → `EM_ANALISE_REEMBOLSO` → Confirmar reembolso. A transição de estado bloqueia repetição da solicitação ou confirmação.
- Confirmar reembolso exige motivo, modalidade e de um a dois comprovantes. Os arquivos ficam em storage privado e são pré-visualizados apenas por rota administrativa tenant-scoped autorizada.
- `TRANSFERENCIA` representa transferência ou estorno manual já executado e comprovado; o HUB não deve fingir uma transferência bancária sem gateway real.
- `CASHBACK` só pode criar crédito e lançamento de carteira depois do lock da transição de pedido, dentro de transação. Reembolso exige auditoria e idempotência.
- Integração com Stripe, Mercado Pago, Pagar.me ou qualquer gateway continua bloqueada até existir adapter, ambiente sandbox, webhook assinado e `payment_attempt` tenant-scoped conforme `07-payments.md`.
