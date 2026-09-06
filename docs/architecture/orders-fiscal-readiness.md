# Pedidos: preparação fiscal e contratos pendentes

Revisão: 2026-09-06. Documento de implementação; integração fiscal ainda não entregue.

## Evidência no código atual

- A prévia fictícia de NF-e foi bloqueada. Enquanto não houver configuração fiscal e adapter homologado, o backend responde `FISCAL_CONFIGURATION_REQUIRED` e não apresenta espelho como documento emitido.
- A declaração usa template Blade próprio, escapa conteúdo variável e exige dados reais do remetente, cliente e endereço.
- Pedidos antigos guardam somente desconto agregado. A API marca o detalhamento como indisponível em vez de preencher loja/VIP/frete com zeros inventados.
- O estado anterior ao pedido de reembolso agora é persistido e restaurado sob lock quando a solicitação é cancelada.

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

## Limites atuais

Nenhum certificado, credencial ou CNPJ foi cadastrado em fornecedor e nenhuma requisição fiscal foi enviada. O gate e o template de declaração estão prontos; configuração por tenant, persistência fiscal, adapter, webhooks, XML, protocolo e DANFE permanecem em UI-025. A UI não pode anunciar essas pendências como concluídas.
