# Retenção e LGPD

Os prazos abaixo são política técnica inicial e precisam de validação jurídica antes da produção.

| Categoria | Prazo proposto | Encerramento |
|---|---:|---|
| Token administrativo | 60 minutos | expiração e revogação |
| Link assinado de documento | 5 minutos | expiração automática |
| Reset e confirmação de e-mail | 7 minutos | remoção do cache após uso/expiração |
| Payload de tracking detalhado | 90 dias | anonimizar ou excluir |
| IP de tracking | não armazenar em claro | armazenar hash |
| Logs técnicos | 30 dias | rotação e exclusão |
| Auditoria administrativa | 5 anos | anonimizar quando permitido |
| Documentos de validação | até conclusão + 180 dias | excluir do storage e metadados |
| Pedidos e registros fiscais | conforme obrigação legal aplicável | restringir e eliminar ao fim da obrigação |
| Conta encerrada | 30 dias para dados não obrigatórios | anonimizar/excluir |

## Direitos do titular

A plataforma deverá permitir localizar, exportar, corrigir, anonimizar e excluir dados por tenant, respeitando retenções legais. Cada operação deve gerar auditoria sem repetir o dado pessoal no texto do log.

## Responsabilidades

Produto define finalidade; jurídico confirma base legal e prazos; engenharia implementa minimização, controle de acesso e exclusão; operação registra exceções e incidentes.
