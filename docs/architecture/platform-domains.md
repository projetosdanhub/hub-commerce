# Domínios técnicos da plataforma

- `app/Domain/ProviderConnections`: OAuth/Connect, instalações e capabilities por lojista.
- `app/Domain/SecretVault`: referências de segredo, criptografia, rotação, revogação e auditoria.
- `app/Domain/Webhooks`: endpoint central, verificação, deduplicação, fila e reconciliação.
- `app/Domain/PlatformBilling`: planos, assinaturas, faturas, cobrança, bloqueio e reativação.
- `resources/js/Modulos/Platform/Vault`: diagnóstico administrativo sem revelar segredos.
- `resources/js/Modulos/Platform/Billing`: operação financeira da plataforma.
- `resources/js/Modulos/Admin/Settings/AppGuides`: livro, dicionário e guias da Central de Apps.
