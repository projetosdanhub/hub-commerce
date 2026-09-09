# Configuração de provedores da plataforma

Este guia trata das **credenciais técnicas do Hub Commerce**. Elas identificam a plataforma perante cada provedor e nunca são exibidas no painel, em logs ou no frontend.

## Antes de habilitar

1. Defina uma URL pública, HTTPS e estável para o app administrativo.
2. Registre exatamente esta URL em cada provedor:

   ```
   https://app.seu-dominio.com/api/oauth/{provider}/callback
   ```

3. No ambiente local, declare `PROVIDER_CONNECTION_REDIRECT_BASE_URL` com uma URL de túnel HTTPS temporária. `localhost` não atende ao requisito de retorno HTTPS do Stripe Connect.
4. No staging/produção, injete todas as variáveis pelo Secret Manager/variáveis protegidas da hospedagem.

## Mercado Pago

Variáveis privadas:

- `MERCADO_PAGO_PLATFORM_CLIENT_ID`
- `MERCADO_PAGO_PLATFORM_CLIENT_SECRET`

O Hub Commerce inicia Authorization Code com PKCE S256, state único de 10 minutos e callback fixo. A troca do código acontece apenas no backend e armazena access/refresh tokens cifrados por instalação e ambiente.

## PagBank Connect

Variáveis privadas:

- `PAGBANK_PLATFORM_CLIENT_ID`
- `PAGBANK_PLATFORM_CLIENT_SECRET`

O aplicativo PagBank deve registrar a URL de callback fixa. O Hub Commerce solicita somente os escopos operacionais de pagamento, conta e checkout, troca o código no backend e cifra as credenciais dinâmicas por instalação.

## Stripe Connect

Variável privada:

- `STRIPE_CONNECT_PLATFORM_SECRET_KEY`

Stripe Connect não reutiliza o callback OAuth de Mercado Pago/PagBank. O próximo adapter criará a conta conectada e um Account Link de uso único, com `return_url` e `refresh_url` HTTPS da plataforma.

## Segurança operacional

- Não defina valores reais em `.env.example`.
- Não crie registros de Cofre que contenham tokens ou valores de credenciais.
- A tela Super Admin deve informar apenas ambiente, estado, última rotação/revogação e auditoria.
- Desconectar uma instalação elimina a credencial cifrada local; a revogação no provedor será tratada pelo adapter específico.
