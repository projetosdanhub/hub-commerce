# Banco e migrations

## Reprodutibilidade

- php artisan migrate:fresh deve funcionar em banco suportado antes do merge.
- Migration publicada é imutável em produção; correções usam nova migration.
- Antes de adicionar coluna, índice ou tabela, pesquisar todo o histórico.
- up e down devem ser coerentes e seguros.
- Scripts avulsos de alteração de schema na raiz são proibidos.

## Modelagem

- Entidades de tenant usam tenant_id, índice e constraints adequadas.
- Unicidade por loja usa índice composto.
- Foreign keys devem definir comportamento de exclusão conscientemente.
- Não duplicar conceitos como Category/Categoria ou campos sinônimos.
- Dinheiro usa decimal com precisão definida e moeda.
- Status usa enum de aplicação e constraint quando suportada.
- Payload JSON não substitui colunas consultadas, constraints ou relacionamentos.
- Dados pessoais sensíveis devem ser minimizados e, quando necessário, criptografados.

## Desempenho e integridade

- Indexar tenant_id junto aos filtros mais usados.
- Evitar N+1 com eager loading deliberado.
- Contadores, estoque, saldo, cupons e transições financeiras exigem atomicidade.
- Toda migração de tenant deve possuir estratégia de backfill, validação e rollback.
- Seeds de produção não podem criar credenciais conhecidas.
