# Checkout, frete e snapshots financeiros

Esta regra é obrigatória para qualquer checkout, orçamento, pedido, pagamento, benefício ou integração logística. Ela complementa `03-multitenancy.md`, `07-payments.md`, `08-database-and-migrations.md` e `14-operational-admin-interactions.md`.

## Fonte de verdade e tenant

- Toda cotação, preço, benefício, pedido e tentativa de pagamento exige tenant resolvido no servidor; identificadores recebidos do navegador são apenas referências e precisam ser buscados dentro desse tenant.
- O navegador envia itens, endereço, seleção e identificadores opacos. Nunca envia subtotal, desconto, frete, total, custo, comissão ou estado financeiro como fonte de verdade.
- Falta de configuração, produto indisponível, cotação expirada ou adapter não homologado deve retornar estado indisponível explícito. Não criar pedido parcial, não aplicar valor fixo e não usar fallback silencioso.

## Precificação e benefícios

- Preços são relidos do catálogo no servidor no instante do checkout. Promoção é válida somente quando persistida; `0,00` pode ser preço real e não pode ser substituído por fallback.
- Cálculos financeiros usam inteiros em centavos no domínio; conversão para decimal/moeda ocorre somente na borda de persistência ou apresentação.
- Todo benefício declara origem, referência, valor e base elegível: `PRODUCT` ou `SHIPPING`. Um benefício nunca migra saldo entre bases.
- O cupom é aplicado antes do VIP. Cada benefício é limitado ao saldo restante da própria base; excesso é erro de domínio, não arredondamento ou desconto oculto.
- Snapshot registra subtotal de produto, frete, bruto, benefícios normalizados, totais por base, líquido, moeda e versão. Depois de criado, ele é imutável; ajustes exigem evento/novo fluxo auditável, nunca sobrescrita silenciosa.

## Frete e cotação

- O frete aceito pelo checkout vem de cotação persistida, tenant-scoped, vinculada ao carrinho/endereço e com expiração.
- O cliente seleciona somente o identificador opaco de uma opção ainda válida. O servidor confirma composição do carrinho, destino, provider, serviço e valor antes de montar o snapshot.
- Preço, prazo, limites, regiões, remetente, embalagem e ambiente pertencem à configuração logística e ao adapter; não ficam hardcoded no controller ou no frontend.
- Provider sem credencial válida, cotação inválida ou frete não elegível bloqueia a conclusão da compra com mensagem segura. Não substituir por preço arbitrário.
- Múltiplas origens, peso volumétrico e regras avançadas são implementados apenas quando catálogo, estoque e checkout suportarem o contrato completo.

## Pedido e pagamento

- O pedido só é persistido de forma atômica após preço, frete e snapshot serem validados no servidor.
- Pagamento usa `payment_attempt` tenant-scoped, chave de idempotência e adapter configurado. Gateway incompleto permanece indisponível; não simular aprovação.
- Webhook assinado e idempotente é a fonte de verdade para pagamento. O retorno do navegador jamais marca pedido como pago.
- Nunca armazenar ou registrar PAN, CVV, senha, token completo ou payload integral de provider.

## Evidências exigidas

- Cobrir em testes: preço relido do catálogo; isolamento entre tenants; promoção real de `0,00`; limites e ordem de benefícios; cotação expirada/adulterada; repetição de checkout; eventos de pagamento fora de ordem.
- Toda alteração de checkout, valor, frete, gateway ou migration financeira atualiza `task-board.md`, `.ai/agent-handoff.md` e as regras afetadas antes de abrir PR.
