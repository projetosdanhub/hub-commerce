# Segurança

Este diretório registra os controles de segurança vigentes e os procedimentos operacionais da HUB Commerce.

## Documentos

- [Perfis e permissões](roles-and-permissions.md)
- [Segredos e rotação](secrets-and-rotation.md)
- [Inventário de dados](data-inventory.md)
- [Retenção e LGPD](retention-and-lgpd.md)
- [Validação da Fase 1](phase-1-runbook.md)

## Regras vigentes

- AGENTS.md e .ai/rules/02-security.md são normativos.
- Rotas administrativas exigem autenticação Sanctum, role admin, status ATIVO e ability admin.
- Credenciais nunca são devolvidas em texto aberto.
- Documentos sensíveis pertencem ao disco privado.
- Pagamentos permanecem desativados até existir adapter real, tokenização e webhook homologado.
- Exceções internas e respostas brutas de fornecedores não são expostas ao cliente.

O modelo de ameaças e o plano completo de resposta a incidentes serão aprofundados antes da produção.
