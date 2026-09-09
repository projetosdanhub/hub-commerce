# Auditoria para repositório público

Atualizado em 2026-09-09.

## Resultado

- O repositório está público e a branch `main` foi auditada.
- Não há `.env`, banco SQLite, arquivos `.db`, certificados, chaves privadas ou dumps versionados na árvore atual.
- O histórico consultado não possui commits associados a `.env`, `database.sqlite` ou `database/database.sqlite`.
- `.env.example` contém somente placeholders e valores locais de exemplo; não contém `APP_KEY`, chaves de gateway ou tokens.
- Os três workflows usam `pull_request`; nenhum usa `pull_request_target`.
- O workflow de segurança já limita o token a `contents: read` e `pull-requests: read`.
- Os workflows de testes e E2E agora também usam `permissions: contents: read`.
- O único segredo referenciado por workflow é o `GITHUB_TOKEN` automático usado pelo Gitleaks; não há credenciais de gateway ou segredos de infraestrutura.

## Correção aplicada

O seeder local tinha valores com aparência de dados pessoais (e-mail, CPF, telefone e endereço). Eles foram substituídos por fixtures sintéticas, com domínio `.invalid` e dados de demonstração. O seeder continua destinado apenas a testes locais/CI; não deve ser usado como cadastro de produção.

## Limite da auditoria

A API do GitHub não permite ler o valor dos Secrets do repositório, portanto não é possível validar o conteúdo armazenado em **Settings → Secrets and variables → Actions**. Os workflows foram verificados para não expor nem solicitar esses segredos.

Antes de adicionar qualquer segredo real, usar o cofre de Actions/Secret Manager e nunca gravá-lo no código, nos seeders ou no banco.
