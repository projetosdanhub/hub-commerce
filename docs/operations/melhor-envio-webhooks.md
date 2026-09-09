# Webhooks do Melhor Envio

## Contrato adotado

- O endpoint pertence ao aplicativo OAuth da plataforma, não à loja.
- O Melhor Envio envia `POST` JSON com o cabeçalho `X-ME-Signature`.
- A assinatura deve ser validada com HMAC-SHA256 do **corpo bruto** usando o secret do aplicativo, antes de interpretar ou persistir o conteúdo.
- O endpoint responde rapidamente após persistir o evento e delega a atualização de rastreio a uma fila idempotente.
- Retentativas do provedor são esperadas; a deduplicação usa uma chave determinística do evento, nunca dados do navegador.
- A instalação que gerar a etiqueta deve ser a mesma em que o webhook está cadastrado.

## Cadastro manual após o deploy

1. Criar o aplicativo no Sandbox em **Integrações → Área Dev**.
2. Registrar a URL de callback OAuth pública e exata da plataforma.
3. No mesmo aplicativo, criar o webhook com a URL pública que será exibida no Cofre/diagnóstico.
4. Guardar Client ID e secret exclusivamente nas variáveis protegidas do ambiente.
5. Repetir no aplicativo de Produção após a homologação Sandbox.

Nenhum token OAuth, secret de aplicativo, payload bruto ou assinatura deve ser exibido no painel, retornado pela API ou registrado em logs.
