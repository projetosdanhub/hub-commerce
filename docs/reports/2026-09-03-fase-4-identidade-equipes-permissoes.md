# Relatório — Fase 4: Identidade, equipes e permissões

## Escopo concluído no backend

- Identidade global com memberships separados para plataforma e lojas.
- RBAC por permissões, com cargos personalizados e delegação limitada.
- Proteção do owner de cada loja e do último superadmin ativo.
- Convites de equipe de loja e de plataforma com token hashado, expiração,
  revogação e aceitação de uso único vinculada ao e-mail.
- Login administrativo por membership, token com abilities mínimas, MFA TOTP,
  códigos de recuperação e sessões revogáveis.
- Recuperação de senha pelo broker do Laravel; a senha não é devolvida em
  resposta da API e as sessões anteriores são revogadas após a troca.
- Verificação de e-mail com URL assinada e comportamento idempotente.
- Auditoria administrativa com redaction de dados sensíveis.
- Variável `SUPERADMIN_URL` documentada em `.env.example`.
- Comando controlado para bootstrap de superadmin:
  `identity:grant-superadmin`.

## Regras de segurança preservadas

- A plataforma não depende do host ou de IDs controlados pelo cliente para
  determinar o superadmin.
- Um administrador de loja não pode alterar o owner da própria loja.
- Um membro de um tenant não pode alterar membership de outro tenant.
- A UI pode ocultar ações, mas as permissões são verificadas nas rotas e
  serviços do backend.
- Segredos MFA são criptografados; tokens de convite e senha não são gravados
  em texto puro no banco.

## Pendências planejadas

| Prioridade | Pendência | Observação |
|---|---|---|
| P1 | Painel visual de superadmin | Backend e rotas de plataforma estão prontos; a interface entra na Fase 10/UI. |
| P1 | Telas de equipe, cargos, convites, MFA e sessões | Consumirão as rotas protegidas desta fase. |
| P1 | Configuração de e-mail transacional em staging/produção | Validar domínio, SPF/DKIM e fluxo real de convite/redefinição. |
| P1 | Bootstrap operacional | Criar a conta ativa do operador e executar o comando de superadmin após o deploy. |
| P2 | Desativar compatibilidade de role legado | Definir data de migração e configurar `IDENTITY_LEGACY_ADMIN_ACCESS=false`. |
| P2 | Reautenticação para operações financeiras críticas | Deve acompanhar os módulos de pagamentos e configurações sensíveis. |

## Validação

Os testes de autorização, convite, senha, e-mail, TOTP e sessão foram
adicionados à suíte. A execução `Tests` do commit
`f414a83975ee42bfcbb97c940f4f5ad13a3ee41a` foi concluída com sucesso em
03/09/2026: [GitHub Actions #33706952727](https://github.com/projetosdanhub/hub-commerce/actions/runs/33706952727).

O ajuste final também valida que a sincronização de cargos preenche o
`tenant_id` obrigatório da tabela pivô, preservando as chaves estrangeiras
compostas e o isolamento entre lojas.
