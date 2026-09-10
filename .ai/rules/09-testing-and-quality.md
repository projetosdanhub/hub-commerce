# Testes e qualidade

## Pirâmide mínima

- Unit: regras puras, enums, cálculos e adapters.
- Feature/API: autenticação, autorização, validação e contratos.
- Integration: banco, filas, storage e gateways em sandbox/fake oficial.
- E2E: login admin, catálogo, carrinho, checkout, pedido e isolamento entre tenants.

## Casos obrigatórios

- Cliente não acessa endpoint administrativo.
- Usuário de um tenant não lê nem altera outro tenant.
- IDs de outro tenant retornam 404/403 sem vazamento.
- Credenciais nunca aparecem em resposta, log ou job.
- Upload privado exige autorização.
- Checkout repetido não duplica cobrança/pedido.
- Webhook duplicado é idempotente.
- Concorrência não cria estoque ou saldo negativo.
- Migrations fresh e rollback controlado funcionam.

## Gates de CI

1. composer validate e composer audit.
2. Laravel Pint/check.
3. PHPUnit com banco limpo.
4. npm ci e npm audit.
5. Build Vite.
6. ESLint e testes frontend.
7. Verificação de imports e TypeScript quando aplicável.
8. Secret scanning e análise estática.
9. E2E crítico antes de release.

Não ignorar teste falhando, não reduzir cobertura para aprovar PR e não substituir teste por mock que elimina a regra avaliada.
