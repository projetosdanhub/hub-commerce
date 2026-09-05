# Pedidos: preparação fiscal e contratos pendentes

Revisão: 2026-09-05. Documento de implementação; integração fiscal ainda não entregue.

## Evidência no código atual

- `OrderController::previewDoc` rotula o caminho NFE como “Recibo Provisório / Espelho de Nota Fiscal”. Isso não comprova assinatura, envio à SEFAZ, protocolo ou autorização.
- O payload administrativo de Pedidos preenche `desconto_vip_produtos` e `desconto_vip_frete` com zero fixo. Não usar esses valores para afirmar ausência de benefício.
- `OrderItem.customization` persiste JSON e é exposto como `personalizacao`, mas o detalhe atual não apresenta seus anexos/textos por item.
- `OrderStatus::REFUND_REVIEW` permite somente REFUNDED; cancelar a solicitação exige recuperar o estado anterior real e validar a transição sob lock. Não basta adicionar um botão.

## Referências consultadas

O Bling descreve o reaproveitamento do cadastro fiscal dos produtos (unidade, NCM e origem) na nota, além da verificação do certificado e da parametrização da operação. É uma referência de ERP usado no e-commerce, não evidência de que toda grande loja opere da mesma forma. [Documentação oficial do Bling](https://ajuda.bling.com.br/hc/pt-br/articles/360037529613-Como-resolver-Problemas-na-Emiss%C3%A3o-de-Notas-Fiscais-no-Bling).

A Focus NFe documenta envio estruturado, assinatura/comunicação fiscal pelo provedor, consultas e webhooks. É uma alternativa de adapter a avaliar, ainda não contratada nem integrada. [Introdução da API](https://doc.focusnfe.com.br/reference/introducao).

Sua API de empresas tem particularidade importante: cadastro opera em produção e documenta `dry_run=1` quando disponível. Não presumir que o cadastro de emitente tem o mesmo ambiente de testes da emissão. [Empresas](https://doc.focusnfe.com.br/reference/empresas).

## Arquitetura proposta para o HUB

1. Configurações > Fiscal por tenant: emitente, CNPJ/IE, regime, endereço, ambiente, série/numeração e provedor. Certificado A1/PFX e senha criptografados no servidor; resposta contém apenas metadados/validade. Outro tipo só é aceito se houver suporte real de assinatura no adapter; não tratar A3 como simples upload de A1.
2. Snapshot fiscal dos itens: preservar SKU, descrição, unidade, NCM, origem e tributação vigente no pedido/emissão. Natureza/CFOP e impostos dependem do cenário da operação; não copiar uma alíquota universal para toda loja.
3. Preflight no backend: conferir tenant, permissão, certificado válido/capacidade de assinatura, emitente e itens completos. Rejeitar emissão não configurada com erro seguro e indicação das pendências. Não gerar uma nota fictícia.
4. Serviço de emissão com adapter, timeout e chave idempotente por tenant/pedido/documento. Persistir solicitado, processando, autorizado, rejeitado e cancelado; reconciliar retorno/webhook autenticado e não repetir emissão por retry do navegador.
5. Armazenar XML, protocolo/chave e DANFE reais, com download autorizado e isolamento por tenant. Somente autorização confirmada permite apresentar “NF-e emitida”.
6. Melhorar declaração de conteúdo em template próprio, com itens/quantidades e identificação necessários; separar claramente da NF-e e preservar escape de todos os campos.
7. Homologar antes de produção: configuração incompleta, certificado expirado, rejeição fiscal, timeout, duplicidade, reconciliação e tentativa entre tenants.

## Limites desta entrega

Nenhum certificado, credencial ou CNPJ foi cadastrado em fornecedor. Não foi enviada requisição de emissão. O adapter, persistência fiscal, gate da API, templates e integração documental ficam em UI-025. A UI não pode anunciar essas pendências como concluídas.
