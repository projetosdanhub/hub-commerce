# HUB Commerce

Plataforma de comércio eletrônico multitenant construída com Laravel, React e Vite.

## Requisitos

- PHP 8.2+ e Composer
- Node.js 24 LTS e npm (a versão canônica está em .nvmrc)
- SQLite (padrão para desenvolvimento e testes)

## Inicialização local

Em uma cópia nova do repositório:

```bash
nvm use
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate --seed
npm ci
npm run build
```

Para iniciar a aplicação:

```bash
php artisan serve --host=127.0.0.1 --port=8000
# em outro terminal
npm run dev
```

Acesse `http://127.0.0.1:8000`. Não adicione credenciais, tokens ou dados de produção ao `.env` versionado.

## Verificações de qualidade

Execute, antes de abrir um PR:

```bash
vendor/bin/phpstan analyse --memory-limit=2G
npm run lint
npm run test:ui
php artisan test
npm run verify:imports
npm run build
```

Os checks completos são executados automaticamente no GitHub Actions. Para a suíte E2E local, instale o navegador do Playwright uma vez com `npx playwright install --with-deps chromium` e execute `npx playwright test`.

## Governança do projeto

- O planejamento é mantido em [task-board.md](task-board.md).
- Todo agente deve ler [AGENTS.md](AGENTS.md) e as regras em [.ai/README.md](.ai/README.md) antes de alterar código.
- Handoffs entre agentes seguem o modelo de [.ai/agent-handoff.md](.ai/agent-handoff.md).
- Mudanças entram por branch e pull request após os checks verdes; evidências externas (como proteção de branch) não podem ser declaradas concluídas sem prova verificável.

## Segurança

Reporte vulnerabilidades de forma privada ao responsável pelo projeto. Nunca exponha segredos, dados pessoais, PAN ou CVV em issues, logs, commits ou testes.
