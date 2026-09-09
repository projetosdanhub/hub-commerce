# Cofre de segredos e ambientes

## Localhost

O desenvolvimento usa `APP_ENV=local` e um arquivo `.env` **não versionado**.

- Execute `php artisan key:generate` uma única vez por ambiente local.
- `APP_KEY` é a chave mestra de criptografia Laravel deste ambiente.
- Use somente credenciais sandbox/teste.
- A aplicação deve permanecer em `127.0.0.1`; não exponha banco, cache ou endpoints administrativos.

## Staging e produção

A chave mestra e credenciais privadas ficam no Secret Manager/variáveis protegidas do provedor de hospedagem, injetadas apenas no processo da aplicação.

Nunca:
- envie segredo por chat;
- salve segredo em Git, seed, log ou frontend;
- reutilize `APP_KEY` entre ambientes;
- revele token após salvamento.

A interface Super Admin exibe somente metadados: ambiente, estado, última sincronização, auditoria e rotação.
