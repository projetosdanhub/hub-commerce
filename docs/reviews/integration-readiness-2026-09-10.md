# Revisão de integrações — 10/09/2026

## Resultado

**O sistema ainda não está pronto para produção nem apenas aguardando homologação.** Esta revisão corrige falhas verificáveis em Stripe, cotação OAuth e operação da Central de Logística. Não libera gateways incompletos nem anuncia o recebimento de webhook como rastreio processado.

Base inspecionada: `75ca49736e1aaff1a05c20bdf23b417cce15eead` (`main`). A análise cobre histórico Git/PRs, contratos de checkout, adapters, conexões OAuth, webhooks, configuração de logística, testes e requisitos de operação. Não representa auditoria exaustiva de todas as telas ou execução no servidor real.

## Git e PRs

- No início da revisão havia **zero PRs abertas**, 80 PRs integradas e 3 encerradas sem merge (#18, #44 e #53).
- O último merge é a PR #83, atualização de dependências. Tests, E2E Tests e Security Scans passaram na revisão `7a39d57` dessa PR. Isso não comprova implantação em produção.
- A PR #52 entrou na branch `orders-financial-snapshot`; suas validações estão no código integrado pela PR #51. Por isso seu SHA de merge não é ancestral direto do main.
- Há 103 branches remotas, incluindo main, com muitas branches históricas de squash/rebase. Não se deve mesclá-las em bloco: isso pode reintroduzir código antigo.
- `fix/assets-root-directory` contém movimentação antiga de assets; `payments/stripe-sandbox` contém dois commits de documentação; `feature/fase-5-catalogo-estoque` contém alterações históricas de testes/sessão e inclusão/remoção de skill. São referências históricas a revisar antes de eventual exclusão, não gateways completos aguardando merge.
- As branches `tmp/*` são tentativas anteriores de rebase; não foram promovidas nem excluídas.
- A branch local preexistente `fix/ngrok-public-api` tem SHAs diferentes do remoto, mas **diff de conteúdo vazio** contra `origin/fix/ngrok-public-api`. Nenhum arquivo dessa cópia foi alterado nesta revisão. Não é possível verificar commits existentes apenas no computador do responsável.

## Correções desta entrega

### Stripe

- Webhook verifica valor, moeda e valor recebido antes de promover pedido.
- Eventos atrasados de falha/cancelamento não rebaixam tentativa paga.
- Aceita múltiplas assinaturas `v1` durante rotação, mantendo tolerância temporal de 300 segundos.
- JSON inválido/configuração ausente retornam erro seguro.
- Dedupe usa `firstOrCreate`, sem capturar erros arbitrários de banco como se fossem replay.
- Webhook pode vincular a tentativa por metadata opaca assinada caso chegue antes da persistência da resposta HTTP.
- Retentativa consulta PaymentIntent conhecido em vez de criar outro; tentativa sem referência há mais de 23 horas exige reconciliação, porque o provedor pode remover a chave idempotente após 24 horas.
- Resposta do PaymentIntent confere ID, valor, moeda e modo test/live.
- Checkout exige chave publicável e webhook configurados antes de criar pedido; implantação Laravel `production` rejeita checkout Sandbox.
- Tipos de pagamento do Stripe limitados a cartão, conforme o contrato atual da tentativa.

### Melhor Envio

- Cotação pública usa OAuth válido da loja e do ambiente ativo; não depende mais de token legado.
- Conexão de outro ambiente, tenant, vencida ou revogada não é usada como fallback.
- Dimensões, peso, CEP e valores são validados, e chamadas têm timeout e erro seguro.
- Somente serviços ativados pela loja entram nas cotações; preço retornado é normalizado sem arredondamento financeiro por float.
- Catálogo de serviços vem da API oficial; removida a associação fictícia entre IDs fixos e transportadoras.
- Remetente passa por allowlist e validação; retirada persistência de `request->all()`.
- Seleção de ambiente tem endpoint autorizado e invalida cotações antigas.
- Central de Logística usa OAuth, removendo o formulário de token manual que chamava endpoint desativado.
- Falhas de mutação têm feedback e a UI só confirma seleção depois da persistência.
- Inbox verifica assinatura e identifica ambiente, limita os campos persistidos e reenvia eventos ainda não processados à fila após retentativa do fornecedor.
- Evento sem vínculo de etiqueta fica com `failed_at`, sem receber `processed_at` fictício. O consumidor ainda exige implementação do vínculo de etiqueta.
- Instalações não anunciam mais URLs de webhook sem rota implementada. O webhook central Melhor Envio usa `/api/webhooks/melhor-envio`.

## Lacunas para fechar o escopo solicitado

| Área | Evidência no código | Implementação que falta |
|---|---|---|
| Stripe | `StripeGateway`, `StripePaymentIntentCreator`, `StripeWebhookProcessor` | Refund, reconciliação automática, fila de webhook, testes de concorrência e fluxo pós-compra; Stripe Connect onboarding ainda retorna indisponível |
| Mercado Pago | OAuth e credenciais cifradas em `ProviderOAuthTokenExchangeService` | Adapter de cobrança, frontend oficial tokenizado, webhook HMAC, refresh, estorno e reconciliação |
| PagBank | OAuth e credenciais cifradas | Adapter de cobrança, tokenização/fluxo contratado, notificações autenticadas, refresh, estorno e reconciliação |
| Pagar.me | Catálogo `API_KEYS` | Cofre de chaves por ambiente, adapter, tokenização, webhook conforme modalidade contratada, refund e reconciliação |
| Melhor Envio: expedição | `OrderController::executarAcao` / ramo `DESPACHAR` | Substituir token legado/sandbox fixo, remover dados fictícios de destinatário, persistir ID e ambiente da etiqueta separados do rastreio e tratar resposta incerta sem duplicação |
| Melhor Envio: ciclo da etiqueta | POST legado para `/me/cart`; job inbox sem vínculo | Compra, geração assíncrona, impressão autorizada, cancelamento verificado, reconciliação, estados fora de ordem e rastreio associado a pedido/tenant |
| Dados do comprador | `StorefrontCustomer` armazena nome/e-mail/senha/status | Capturar e validar os dados realmente exigidos pelos provedores e pelo documento de envio; o legado não pode substituir CPF/telefone por valores fictícios |
| Produção | Board OPS-001 a OPS-012 | Servidor e domínio reais, secrets no cofre, workers/scheduler, banco/cache, backup/restore, pipeline, rollback e verificação externa |
| Qualidade | Workflows atuais limitam parte de lint/análise a arquivos novos | Sanear dívida global registrada em QA; sucesso da CI atual não significa lint/análise integral sem dívida |

O recebimento de um webhook não confirma processamento de pagamento nem postagem. Inserir frete no carrinho não significa comprar/gerar/imprimir etiqueta. A seleção de um ambiente não significa que suas credenciais foram homologadas.

## Teste e produção

1. Disponibilizar as credenciais dos aplicativos/contas autorizadas no cofre; não publicar segredos em PR, chat, logs ou arquivos versionados.
2. Confirmar modalidade de integração das contas: Stripe direto ou Connect; modelo contratado Pagar.me e PagBank; meios habilitados em cada conta.
3. Completar as lacunas da tabela e executar testes de assinatura, replay, concorrência, falha de rede, isolamento e reconciliação por provedor.
4. Em ambiente de testes, validar checkout real, autenticação adicional, recusas, PIX/boleto quando implementados, refund e ciclo completo da etiqueta.
5. Em produção: `APP_ENV=production`, `APP_DEBUG=false`, HTTPS e proxies explícitos, cookies seguros, credenciais PRODUCTION, workers e scheduler monitorados. A troca de ambiente não substitui aprovação do provedor.
6. Antes de release: backup/restauração comprovados, health checks, rollback e revisão humana das mudanças financeiras conforme `.ai/rules/10-git-and-delivery.md`.

## Evidências de validação

- `npm ci --no-audit --no-fund`: concluído com lockfile preservado.
- `npm run verify:imports`: 140 arquivos verificados.
- `npm run build`: passou; permanece aviso de bundle acima de 500 kB.
- `npm run test:ui`: 4 testes Vitest e 6 testes de interação passaram antes das últimas correções; a suíte será repetida na revisão final.
- ESLint direcionado: validado após remoção do estado duplicado e do overlay de sucesso legado.
- PHP/Composer/Docker não estão instalados nesta sessão; instalação de dependências de sistema falhou por restrição do ambiente. PHPUnit e os gates backend serão executados pela PR no GitHub Actions.
- Nenhuma chamada com credenciais reais, cobrança, compra de etiqueta, implantação ou alteração de produção foi executada.

## Referências técnicas consultadas

- https://docs.stripe.com/webhooks
- https://docs.stripe.com/api/idempotent_requests
- https://docs.melhorenvio.com.br/reference/listar-servicos
- https://docs.melhorenvio.com.br/docs/webhooks
- https://docs.melhorenvio.com.br/docs/fluxo-completo-de-integracao
- https://docs.melhorenvio.com.br/docs/geracao-e-impressao-de-etiquetas-de-envio
