# Atualização segura de bancos já existentes

Este procedimento é obrigatório para qualquer ambiente que já contenha dados de loja. Ele protege contra duas falhas comuns: aplicar migrations sobre um schema alterado manualmente e usar rollback para desfazer dados que não podem ser reconstruídos com segurança.

## Princípios

- Nunca executar `migrate:fresh`, `migrate:reset`, `db:wipe` ou comandos equivalentes em uma base compartilhada ou com dados reais.
- Uma migration publicada não é reescrita. A correção é sempre uma nova migration compatível.
- Alterações de schema seguem expandir, migrar dados, validar e somente então contrair.
- Todo deploy de banco exige backup com restauração já verificada em ambiente isolado.

## Antes do deploy

1. Coloque a versão do código que será implantada em uma máquina de manutenção.
2. Gere um backup consistente da base e confirme que ele pode ser restaurado.
3. Verifique histórico e drift sem alterar dados:

   ```bash
   php artisan database:preflight --json
   php artisan migrate:status
   php artisan migrate --pretend --force
   ```

4. Interrompa o processo se `database:preflight` retornar `blocked`. O comando bloqueia, entre outros casos, tabelas de negócio sem tabela `migrations`, histórico que não existe mais no código e colunas fiscais existentes sem a migration correspondente no histórico.
5. Registre a versão, horário, responsável pelo backup e resultado do `--pretend` na mudança de produção.

## Execução

1. Ative a manutenção quando houver migration com backfill ou lock relevante.
2. Execute somente migrations forward:

   ```bash
   php artisan migrate --force
   php artisan database:preflight --json
   ```

3. Valide o health check, uma operação de leitura por tenant e os logs sem expor dados pessoais.
4. Reative o tráfego somente após a validação.

## Rollback

`php artisan migrate:rollback --step=1 --force` só pode ser usado imediatamente após o deploy, depois de `php artisan migrate:rollback --step=1 --pretend`, e apenas para uma migration declarada reversível no release.

Não faça rollback de migrations históricas de correção ou de backfill em uma base existente. Caso uma migration de dados tenha sido aplicada ou haja dúvida sobre a origem de uma coluna, restaure o backup validado e abra uma migration corretiva forward. Isso evita apagar uma coluna ou vínculo que já existia antes da migration.

## Correção fiscal legada

A migration `2026_08_24_175459_add_missing_fiscal_fields_to_produtos_table` foi corrigida para não repetir o campo `gtin`; ela adiciona somente `unidade_medida` quando este campo ainda não existe.

O teste `ExistingDatabaseMigrationTest` cobre o caso de uma tabela `produtos` que já possui `gtin`, confirma a preservação do dado e valida o rollback da coluna adicionada pela correção. Quando `unidade_medida` já existia antes, a migration não a altera e o rollback histórico não deve ser utilizado.
