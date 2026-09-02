# Pagamentos

Cada gateway deve possuir documentação própria com credenciais exigidas, ambientes, tokenização frontend, requests backend, webhooks, idempotência, estados, refund, reconciliação e testes.

Nenhum gateway pode ser marcado como disponível enquanto retornar aprovação simulada ou receber PAN/CVV diretamente. O contrato normativo está em .ai/rules/07-payments.md.


## Estado após a Fase 1

Todos os adapters fictícios foram desativados. O checkout rejeita PAN/CVV e retorna indisponibilidade até que um gateway real seja implementado e homologado. Nenhum resultado local pode transicionar o pedido para `paid` sem uma resposta aprovada de um adapter real.
