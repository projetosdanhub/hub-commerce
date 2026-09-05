# Política de estoque de reembolso

Revisão: 2026-09-05. Esta é uma decisão arquitetural para a implementação de `CAT-009`; não cria tabelas, saldo ou movimentações nesta entrega.

## Regra de negócio aprovada

Um pedido que já foi entregue e posteriormente reembolsado **não recompõe automaticamente o estoque vendável**. Se o item retornar fisicamente, ele deve entrar primeiro no **estoque de reembolso** (quarentena), separado do estoque normal. A decisão de devolver ao estoque vendável ou dar baixa definitiva pertence ao futuro módulo de estoque e deve ser uma ação explícita e auditável.

Um reembolso financeiro sem confirmação de devolução física não cria nem incrementa saldo de estoque.

## Fluxo esperado

1. Cancelamento em `A_PAGAR`: apenas libera a reserva existente conforme a regra de estoque; não é reembolso nem retorno físico.
2. Solicitação/confirmação de reembolso: registra a operação financeira, os comprovantes privados e a auditoria. Não move estoque por si só.
3. Recebimento físico da devolução: operador identifica pedido, item, SKU e variante e registra a entrada no estoque de reembolso.
4. Triagem: o operador autorizado transfere explicitamente do estoque de reembolso para o estoque vendável ou registra baixa definitiva/avaria. A tela deve mostrar motivo, quantidade, responsável e data.

## Invariantes para CAT-009

- Todo local, saldo e movimento é tenant-scoped; item e variante pertencem ao mesmo tenant do pedido.
- A origem deve referenciar `order_item`, o pedido, a devolução e uma chave idempotente. Reprocessar o mesmo evento não duplica saldo.
- Alteração de saldo usa transação e lock no serviço de estoque; controladores e UI não calculam quantidade.
- A entrada de reembolso é por item/variante, nunca somente pelo pedido agregado. Itens parciais e personalizados continuam identificados pelo item original.
- O estoque de reembolso não pode ser considerado disponível para nova venda, catálogo público, reserva ou métrica de “em estoque”.
- Não há retorno automático ao estoque normal, inclusive quando o reembolso for confirmado após `ENTREGUE`.
- A operação exige autorização administrativa e trilha de auditoria; arquivos/comprovantes continuam privados e autorizados por tenant.

## Dependências e limites atuais

O serviço transacional de estoque (`CAT-003`) e o local de estoque de reembolso (`CAT-009`) não existem no contrato atual. Por isso, `UI-021` somente registra a regra e `UI-022` não deve simular uma reposição. A implementação futura precisa cobrir devolução parcial, concorrência, reprocessamento, troca de variante, cancelamento de retorno e testes negativos entre tenants.

A experiência de Pedidos poderá informar que um reembolso de item entregue aguarda recebimento/triagem, mas só depois de existir contrato real tenant-scoped para esse estado.
