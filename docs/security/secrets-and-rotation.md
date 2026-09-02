# Segredos e rotação

## Armazenamento

Credenciais de tracking, gateways e Melhor Envio são criptografadas com APP_KEY. Endpoints administrativos devolvem apenas valores públicos e o marcador fixo `********` para segredos configurados. Jobs recebem o ID da configuração e resolvem a credencial dentro de `handle()`.

## Rotação obrigatória de tokens potencialmente expostos

A rotação é uma operação externa e não pode ser concluída por commit.

| Provedor | Segredo | Ação |
|---|---|---|
| Meta | CAPI access token | emitir novo, testar evento, revogar antigo |
| Google Analytics 4 | Measurement Protocol API secret | criar novo, validar DebugView, excluir antigo |
| TikTok | Events API access token | emitir novo, validar evento, revogar antigo |
| Pinterest | Conversions API access token | emitir novo, validar evento, revogar antigo |
| Melhor Envio | access token | emitir novo, testar /me, revogar antigo |
| Gateways | secret/access keys | manter inativos até homologação da Fase 7 |

## Procedimento

1. Aplicar as migrations de criptografia.
2. Emitir uma chave nova no painel do fornecedor.
3. Salvar a chave nova no painel administrativo.
4. Processar um evento controlado e conferir a entrega.
5. Revogar a chave anterior no fornecedor.
6. Confirmar que filas e logs não contêm o valor.
7. Registrar data, responsável e resultado sem copiar o segredo.

SEC-002 só pode ser marcado como concluído depois que todas as chaves antigas forem revogadas.
