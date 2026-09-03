# Contrato HTTP da API

Este contrato se aplica a todas as rotas sob `/api`. Os clientes devem decidir o fluxo pelo status HTTP e pelo campo `code`, nunca comparando o texto de `message`.

## Respostas de sucesso

Recursos e coleções usam `status: "success"` e, quando há conteúdo, o campo `data`.

```json
{
  "status": "success",
  "data": {}
}
```

Comandos sem representação obrigatória podem retornar apenas uma mensagem:

```json
{
  "status": "success",
  "message": "Operação concluída."
}
```

Criação de recurso deve usar HTTP `201`; exclusão sem corpo pode usar `204`. Respostas existentes que ainda possuem corpo usam `200` até que o consumidor React seja migrado no mesmo PR.

## Respostas de erro

Todo erro da API usa o mesmo envelope:

```json
{
  "status": "error",
  "code": "VALIDATION_FAILED",
  "message": "Os dados informados são inválidos.",
  "errors": {
    "email": ["O campo email é obrigatório."]
  }
}
```

`errors` só existe em falhas de validação. `message` é segura para exibição e pode mudar; `code` é estável para lógica de cliente.

## Códigos HTTP e códigos estáveis

| HTTP | code | Uso |
|---:|---|---|
| 400 | `BAD_REQUEST` | Requisição sintaticamente válida, mas inválida para a operação |
| 401 | `UNAUTHENTICATED` | Credencial ausente ou sessão inválida |
| 403 | `FORBIDDEN` | Usuário autenticado sem permissão |
| 404 | `RESOURCE_NOT_FOUND` | Rota ou recurso não encontrado no tenant atual |
| 405 | `METHOD_NOT_ALLOWED` | Método HTTP não suportado |
| 409 | `CONFLICT` | Conflito com o estado atual do recurso |
| 419 | `SESSION_EXPIRED` | Sessão expirada |
| 422 | `VALIDATION_FAILED` | Campos inválidos ou transição de domínio proibida |
| 423 | `TENANT_UNAVAILABLE` | Loja suspensa ou temporariamente indisponível |
| 429 | `RATE_LIMITED` | Limite de requisições excedido |
| 500 | `INTERNAL_ERROR` | Falha interna não exposta ao cliente |
| 503 | `SERVICE_UNAVAILABLE` | Dependência temporariamente indisponível |

Erros de negócio explícitos podem usar um código mais específico, como `PAYMENT_UNAVAILABLE` ou `SHIPPING_PROVIDER_REJECTED`. Quando ainda não existe um código de domínio próprio, usa-se `REQUEST_FAILED`.

## Segurança e observabilidade

- Exceções internas e corpos de provedores externos nunca são enviados ao cliente.
- Erros inesperados são registrados com a classe da exceção e o `X-Request-ID`, sem secrets ou PII.
- Um recurso de outro tenant responde como não encontrado.
- Cabeçalhos relevantes, como `Retry-After`, são preservados.
