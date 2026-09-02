# Pagamentos

Pagamentos são domínio crítico. Implementação real exige ambiente sandbox, testes automatizados e revisão de segurança antes de produção.

## Dados de cartão

- PAN, CVV e validade nunca transitam pelo backend do HUB.
- Usar SDK/Hosted Fields oficial para gerar token ou payment method no navegador.
- O backend recebe apenas identificador tokenizado e dados mínimos.
- CVV nunca é armazenado, logado ou enviado a analytics.

## Arquitetura

Definir PaymentGateway interface e adapters Stripe, MercadoPago e Pagarme. Um PaymentService coordena o caso de uso sem condicionais espalhadas. Credenciais são por tenant e ambiente, criptografadas, nunca retornadas completas.

## Fluxo

- Criar order em estado pending_payment.
- Criar payment_attempt com idempotency_key única por tenant/gateway.
- Enviar valor calculado no servidor.
- Tratar resposta inicial como pendente quando apropriado.
- Webhook assinado é a fonte autoritativa para confirmação.
- Atualizar pagamento e pedido em transação, com transições idempotentes.
- Registrar gateway_transaction_id e códigos seguros, não payloads integrais.
- Nunca marcar paid por simples retorno do frontend.

## Webhooks

- Verificar assinatura, timestamp e ambiente.
- Persistir gateway_event_id com unique para impedir replay.
- Responder rapidamente e processar em job.
- Suportar retry, eventos fora de ordem e reconciliação.
- Tenant deve ser resolvido por conta/metadata confiável, nunca por campo arbitrário.

## Operação

- Separar test/live e bloquear credencial de teste em produção.
- Refund exige permissão, motivo, auditoria e idempotência.
- Conciliação periódica compara pedidos e gateway.
- Feature flag mantém gateways incompletos indisponíveis.
