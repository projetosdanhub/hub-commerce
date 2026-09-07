# Benefícios, Hub Coins, cupons e afiliados

Esta regra é obrigatória para benefícios comerciais, fidelidade, Hub Coins, níveis VIP, loja de cupons e afiliados. Ela complementa as regras 03, 07, 12, 14 e 15.

## Domínios e navegação

- Marketing trata campanhas, audiência, benefícios comerciais e performance. Não é o dono do saldo do cliente.
- Fidelidade trata Hub Coins, regras de recompensa, resgates e extrato. A carteira pertence ao domínio Customers/Loyalty.
- Clientes trata perfil, segmentação e níveis VIP. A elegibilidade VIP é calculada no servidor e não é uma edição direta de saldo.
- Afiliados trata vínculo, atribuição, comissão e repasse. Não compartilha cupom, saldo ou métrica sem referência auditável.
- Cupons pertencem ao domínio Benefits; a Loja de Cupons é apenas o canal de resgate, nunca uma segunda regra de desconto.
- Cada grupo pode possuir rota e submenu próprios no painel, mas não duplica API, estado remoto ou regra de negócio.

## Estrutura de frontend por subdomínio

- Um monólito administrativo não recebe novos fluxos de Marketing, Benefits, Loyalty, Customers/VIP, Affiliates ou Apps.
- Cada domínio fica em pasta própria, com página-orquestradora, componentes locais, consultas/mutações e testes próximos ao contrato que utiliza. Componentes visuais e interações genéricas permanecem no Design System.
- Dependências entre domínios atravessam contratos públicos, eventos ou serviços de aplicação; um componente não lê estado interno de outro domínio.
- Arquivos de página/orquestração permanecem pequenos e delegam seções a componentes semânticos. Não recriar ícones, CSS global, modais ou consultas já canônicas.
- Rotas de transição podem apresentar apenas estado operacional honesto enquanto o contrato não estiver pronto; não preservam mocks para preencher a interface.

## Fonte de verdade e isolamento

- Toda regra, cupom, recompensa, resgate, vínculo de afiliado, comissão e transação de Hub Coins é tenant-scoped.
- O navegador envia somente código, identificador opaco ou intenção de resgate. Não informa desconto, saldo, comissão, elegibilidade, valor de moeda ou estado financeiro.
- Identificadores de outro tenant retornam 404 ou 403 sem expor existência.
- Métricas exibem apenas consultas reais e documentadas. Sem contrato, a interface mostra indisponibilidade; nunca zero, previsão ou contagem de demonstração.

## Hub Coins e recompensas

- Hub Coins usam ledger imutável. O saldo é derivado de créditos, débitos, expiração e estornos auditáveis; um campo agregado pode existir apenas como projeção consistente.
- Cada lançamento declara: cliente, tenant, direção, quantidade inteira, origem, referência idempotente, motivo seguro, data e estado.
- A concessão por recompensa exige evento de negócio confiável, regra ativa, elegibilidade validada e chave idempotente por cliente, regra e evento.
- Regra de recompensa declara gatilho, quantidade, limites por cliente/período, vigência, status e versão. Critérios configuráveis não podem ser executados como expressão livre recebida do navegador.
- Resgate em Loja de Cupons cria lançamento de débito e emissão/reserva de benefício na mesma transação. Saldo insuficiente, regra expirada ou resgate repetido falham de forma explícita.
- Crédito manual exige permissão específica, motivo e auditoria. Nunca altera saldo sem lançamento de ledger.

## Cupons e benefícios

- Cupom declara código único por tenant, tipo, moeda, base elegível (`PRODUCT` ou `SHIPPING`), valor, teto, vigência, limite global/por cliente e status.
- Cupom de frete só é avaliado depois que há endereço e cotação persistida válidos.
- Benefício por produto, benefício geral da loja, desconto de frete, cupom de frete e VIP são regras distintas. Todos registram origem, referência e base elegível.
- O cupom é avaliado antes do VIP. Nenhum benefício transfere saldo entre produto e frete ou supera o saldo restante da própria base.
- O checkout registra benefícios normalizados no snapshot imutável; uso, cancelamento, expiração ou ajuste posterior geram evento auditável, nunca sobrescrita silenciosa.

## VIP

- Nível VIP é tenant-scoped, possui critérios explícitos, vigência/status e benefícios declarados por base.
- A concessão de nível é calculada a partir de dados reais autorizados (por exemplo, pedidos pagos), sem confiança em valores enviados pela interface.
- Alterar nível ou benefício não reescreve snapshot de pedido já criado.

## Afiliados

- Perfil de afiliado, código, atribuição, comissão, saldo e repasse são tenant-scoped.
- Comissão nasce somente de evento confiável de pedido elegível/pago e referencia pedido, afiliado, regra e versão.
- Cancelamento ou reembolso gera reversão idempotente, auditável e vinculada à comissão original.
- A interface não promete comissão, saldo ou conversão enquanto a consulta correspondente não existir.

## Interface administrativa

- O painel usa submenus semânticos: Marketing, Benefícios e Cupons, Fidelidade, Clientes/VIP e Afiliados.
- Filtros de status, período, busca, ordenação e métricas só são exibidos quando consultam contrato real tenant-aware.
- A Loja de Aplicativos apresenta cartões de aplicativos, conexão, ambiente, diagnóstico e permissões apenas com configuração persistida por tenant; segredos são mascarados.
- Desktop, mobile, claro e escuro seguem tokens e primitives canônicas. A preferência de tema é apenas de aparência e não contém dados de negócio.
