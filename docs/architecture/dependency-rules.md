# Regras de dependência

## Regra principal

Um módulo pode conhecer o contrato público de outro módulo, mas não seus controllers, telas, queries internas ou tabelas como atalho.

## Dependências permitidas

| Origem | Destino permitido | Mecanismo |
|---|---|---|
| Controller/API | Action do mesmo módulo | chamada direta |
| Action | Model/Service/Policy do mesmo módulo | chamada direta |
| Action | Outro módulo | interface pública, DTO ou evento |
| Job | Action/Service | identificadores + TenantContext |
| Storefront | API pública | cliente HTTP storefront |
| Admin | API administrativa | cliente HTTP admin |
| Adapter | API externa | interface, timeout e retry |
| Read model | múltiplos módulos | query dedicada, somente leitura e tenant-scoped |

## Dependências proibidas

- Storefront importando componente ou endpoint Admin.
- Componente React acessando banco, secrets ou regra de autorização.
- Controller chamando controller.
- Módulo atualizando tabela pertencente a outro módulo.
- Model disparando cobrança, e-mail ou HTTP externo implicitamente.
- Shared Kernel dependendo de módulo de negócio.
- Job contendo credencial ou objeto Eloquent serializado sem necessidade.
- Uso de singleton id=1 para configuração de loja.
- Cache sem tenant em dados tenant-owned.
- Route binding global para recurso tenant-owned.
- Dependência circular, mesmo por helper.

## Comunicação síncrona e assíncrona

Use chamada síncrona quando a resposta for necessária para concluir a transação e a operação estiver dentro do mesmo processo. Use evento/job para efeitos posteriores como e-mail, tracking, geração de documento ou sincronização.

Evento descreve fato concluído, por exemplo OrderPaid. Comando descreve intenção, por exemplo CapturePayment. Não usar eventos vagos como DataUpdated.

## Propriedade de dados

- Um módulo escreve somente nos dados que possui.
- Outros módulos recebem ID, DTO, read model ou evento.
- Relatórios cruzados usam queries dedicadas e somente leitura.
- Toda leitura tenant-owned exige TenantContext.
- Integrações mantêm IDs externos no módulo adapter/proprietário.

## Fiscalização

Adicionar progressivamente:

- testes de arquitetura PHP;
- regras ESLint de boundaries;
- verificação de imports relativos;
- testes de isolamento;
- revisão obrigatória para exceções.

Exceção temporária precisa de tarefa no task-board com prazo de remoção. Exceção permanente precisa de ADR.
