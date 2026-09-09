# Ambiente local com Docker

Este Compose substitui XAMPP no desenvolvimento local. Ele **não** é configuração de staging ou produção.

## Serviços

| Serviço | Endereço local |
|---|---|
| Hub Commerce | http://localhost:8000 |
| Vite | http://localhost:5173 |
| PostgreSQL | 127.0.0.1:5432 |
| Redis | 127.0.0.1:6379 |
| MinIO Console | http://localhost:9001 |
| Mailpit | http://localhost:8025 |

As portas são vinculadas a `127.0.0.1`; não ficam acessíveis pela rede local.

## Primeira inicialização

```bash
cp .env.example .env
docker compose -f docker-compose.dev.yml up -d --build
docker compose -f docker-compose.dev.yml exec app php artisan key:generate
docker compose -f docker-compose.dev.yml exec app php artisan migrate --seed
```

Nunca substitua um `.env` já preenchido sem antes fazer backup local.

## Rotina diária

```bash
docker compose -f docker-compose.dev.yml up -d
docker compose -f docker-compose.dev.yml logs -f app queue vite
```

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

## Webhook Melhor Envio

Os testes automatizados executam inteiramente no Docker. O callback real do Sandbox exige uma URL HTTPS pública temporária; essa etapa só ocorre após os testes locais verdes.
