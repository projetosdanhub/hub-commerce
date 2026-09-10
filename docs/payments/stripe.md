# Stripe por loja

O Stripe é configurado no **Centro de Apps** de cada loja. A configuração guarda separadamente as credenciais de **Sandbox** e **Produção**, criptografadas no banco e nunca retornadas pela API.

## Credenciais

Cada ambiente possui:

- chave publicável;
- chave secreta;
- segredo de webhook.

A chave publicável começa com `pk_test_` ou `pk_live_`; a chave secreta começa com `sk_test_` ou `sk_live_`. O ambiente ativo é explícito e não troca nem remove as credenciais do outro ambiente.

## Contrato do adapter

O adapter envia para o Stripe apenas:

- valor reconstruído pelo servidor em centavos;
- moeda ISO;
- PaymentMethod oficial tokenizado;
- chave de idempotência da tentativa;
- referência opaca da tentativa como metadata.

Ele não recebe PAN, CVV ou validade. A resposta inicial, inclusive quando o Stripe informar sucesso, não altera localmente o pedido para pago. Somente o webhook assinado e idempotente poderá fazê-lo.

## Testes simulados

A suíte automatizada usa o fake HTTP do Laravel para validar o contrato do PaymentIntent tanto em Sandbox como em Produção, sem usar chaves reais ou acessar a rede. A homologação externa continua obrigatória antes de liberar checkout e webhooks.
