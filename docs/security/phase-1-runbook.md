# Validação da Fase 1

Execute após baixar a branch.

```bash
composer install
php artisan config:clear
php artisan migrate
php artisan security:migrate-private-documents --dry-run
php artisan security:migrate-private-documents
php artisan test --filter=PhaseOneSecurityTest
php artisan test --filter=SecurityBoundaryTest
npm ci
npm run build
```

## Verificações manuais

- Um cliente e um admin suspenso recebem 401 no login administrativo.
- O logout invalida imediatamente o bearer token.
- /api/tracking nunca contém access token ou API secret.
- A sétima tentativa de login dentro de um minuto recebe 429.
- Checkout não mostra campos de PAN, validade ou CVV e não aprova pedido.
- URLs de RG, CNH, comprovante e romaneio expiram e exigem admin autenticado.
- Banco não contém credenciais legíveis após as migrations.
- Fila serializada contém destinationId, nunca credentials.
- Respostas 5xx não incluem exception, stack trace ou body do fornecedor.
- Respostas incluem CSP, nosniff, referrer policy e HSTS sob HTTPS.

A migration de documentos deve ser executada antes de remover qualquer backup. Se o comando avisar que um arquivo não foi encontrado, interrompa a publicação e investigue o caminho.
