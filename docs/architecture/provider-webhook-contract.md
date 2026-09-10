# Contrato de conexões e webhooks

## URL central

```
https://hooks.hubcommerce.app/v1/payments/{provider}/{installation_uuid}
```

O `installation_uuid` é opaco, aleatório e não é ID sequencial, slug ou domínio do lojista.

## Responsabilidades

- O domínio da loja atende vitrine, checkout e pixels após verificação.
- O domínio do Hub Commerce recebe webhooks.
- O handler valida assinatura e timestamp, persiste o evento bruto criptografado, deduplica por evento externo e enfileira processamento.
- A confirmação financeira vem do webhook/reconciliação no backend, nunca do navegador.

## Estratégias

| Provedor | Conexão da loja |
|---|---|
| Stripe | Connect Onboarding |
| Mercado Pago | OAuth |
| PagBank | Connect OAuth |
| Pagar.me | Chaves API por ambiente |

O billing do Hub Commerce é separado dos gateways das lojas.
