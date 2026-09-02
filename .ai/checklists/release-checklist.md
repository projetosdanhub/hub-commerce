# Checklist de release

- [ ] CI completamente verde no commit da release.
- [ ] Backup e rollback confirmados.
- [ ] APP_ENV=production e APP_DEBUG=false.
- [ ] HTTPS, cookies seguros e cabeçalhos ativos.
- [ ] Secrets configurados fora do Git e rotacionados quando necessário.
- [ ] Migrations revisadas e testadas com dados representativos.
- [ ] Workers, scheduler, cache e storage operacionais.
- [ ] Gateways no ambiente correto e webhooks verificados.
- [ ] Teste de isolamento entre tenants aprovado.
- [ ] Smoke test de loja, admin, catálogo, checkout e pedidos.
- [ ] Logs, métricas e alertas disponíveis sem PII.
- [ ] Feature flags mantêm recursos incompletos desativados.
