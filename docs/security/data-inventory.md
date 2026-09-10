# Inventário de dados

Classificação inicial para revisão jurídica e de produto.

| Dado | Classe | Finalidade | Local atual | Acesso |
|---|---|---|---|---|
| Nome, e-mail e telefone | Pessoal | conta, pedido e suporte | users/orders | cliente e admin autorizado |
| CPF e nascimento | Pessoal sensível operacional | fiscal, antifraude ou correção cadastral | users | admin autorizado |
| Endereço | Pessoal | entrega e cobrança | addresses/order_addresses | cliente e admin autorizado |
| RG, CNH e comprovantes | Restrito | validação operacional | storage privado | URL assinada e admin autorizado |
| Credenciais de integrações | Segredo | comunicação com fornecedores | colunas criptografadas | backend somente |
| IP e user-agent | Pessoal técnico | segurança e atribuição | tracking_logs | hash/minimização e admin |
| Eventos de navegação | Pessoal/pseudônimo | métricas e conversão | tracking_logs | admin autorizado |
| Dados de pagamento | Restrito PCI | autorização no gateway | token externo somente | gateway; não armazenar PAN/CVV |
| Logs de auditoria | Confidencial | rastreabilidade | audit tables | admin autorizado |
| Tokens de sessão | Segredo | autenticação | personal_access_tokens | hash do Sanctum |

## Princípios

Coletar somente o necessário, definir tenant em todo dado tenant-owned, usar identificadores pseudônimos para tracking e impedir que documentos ou segredos sejam servidos pelo disco público.
