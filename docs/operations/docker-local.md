# Ambiente local com Docker

Este Compose substitui XAMPP no desenvolvimento local. Ele **não** é configuração de staging ou produção.

## Serviços

| Serviço | Endereço local |
|---|---|
| Hub Commerce | http://localhost:8000 |
| Vite (perfil `frontend-dev`) | http://localhost:5173 |
| PostgreSQL | 127.0.0.1:5432 |
| Redis | 127.0.0.1:6379 |
| MinIO Console | http://localhost:9001 |
| Mailpit | http://localhost:8025 |

As portas são vinculadas a `127.0.0.1`; não ficam acessíveis pela rede local.

## Primeira inicialização

```bash
cp .env.example .env
docker compose -f docker-compose.dev.yml up -d --build
docker compose -f docker-compose.dev.yml run --rm vite npm run build
docker compose -f docker-compose.dev.yml exec app php artisan key:generate
docker compose -f docker-compose.dev.yml exec app php artisan migrate --seed
```

Nunca substitua um `.env` já preenchido sem antes fazer backup local.

## Rotina diária

```bash
docker compose -f docker-compose.dev.yml up -d
docker compose -f docker-compose.dev.yml logs -f app queue
```

O Compose padrão usa os assets compilados em `public/build`, compatíveis com o túnel HTTPS. Para desenvolvimento com recarga em tempo real somente no navegador local, inicie o perfil opcional:

```bash
docker compose -f docker-compose.dev.yml --profile frontend-dev up -d vite
```

O Vite expõe `http://localhost:5173` ao navegador e o container continua escutando internamente em `0.0.0.0`. Não use HMR ao testar a URL pública do túnel.

Para parar sem apagar dados:

```bash
docker compose -f docker-compose.dev.yml down
```

Os volumes locais só são removidos com `docker compose -f docker-compose.dev.yml down -v`. Esse comando apaga banco, cache e storage local.

## Credenciais e gateways

- Use somente Sandbox no `.env` local.
- Não use credenciais de Produção em `APP_ENV=local`.
- Tokens OAuth de lojistas são gravados criptografados pelo backend; nunca cole tokens de loja no frontend.
- O arquivo `.env.example` continua sem valores secretos.

## Túnel HTTPS local

Para OAuth e webhooks de provedores, exponha temporariamente o Laravel com um túnel HTTPS, por exemplo `ngrok http 8000`. No `.env`, informe o domínio público em `PROVIDER_CONNECTION_REDIRECT_BASE_URL` e `HUB_WEBHOOK_BASE_URL`, e use `TRUSTED_PROXIES=*` somente neste ambiente local controlado. Não use esse valor em staging ou produção; nesses ambientes, informe apenas os IPs/CIDRs dos proxies reversos confiáveis.

Antes de abrir a URL pública, pare o HMR, gere os assets e remova o marcador de desenvolvimento:

```bash
docker compose -f docker-compose.dev.yml --profile frontend-dev stop vite
docker compose -f docker-compose.dev.yml run --rm vite npm run build
docker compose -f docker-compose.dev.yml exec app sh -lc 'rm -f public/hot && php artisan optimize:clear'
```

Recrie os containers `app` e `queue` depois de atualizar o código. O Compose repassa `TRUSTED_PROXIES` do seu `.env` ao processo do PHP, inclusive quando houver cache de configuração. Mantenha `APP_URL=http://localhost:8000`; durante uma requisição web, o Laravel usa o host e o protocolo HTTPS reconhecidos pelos cabeçalhos confiáveis do ngrok para gerar os assets. Em seguida faça um recarregamento forçado no navegador. O túnel deve servir apenas os arquivos HTTPS de `/build/assets`; não libere `0.0.0.0` nem uma origem HTTP do ngrok na CSP.

## Webhook Melhor Envio

Os testes automatizados executam inteiramente no Docker. O callback real do Sandbox exige uma URL HTTPS pública temporária; essa etapa só ocorre após os testes locais verdes.
