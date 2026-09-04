# HUB Commerce — instruções do repositório

Este arquivo se aplica a todo o repositório. KIA, Codex e qualquer agente automatizado devem lê-lo antes de analisar ou alterar código.

## Ordem de autoridade

1. Solicitação explícita do responsável pelo projeto.
2. Este arquivo.
3. Regras específicas em .ai/rules.
4. Decisões aprovadas em docs/adr.
5. Documentação técnica vigente.

Em caso de conflito, pare, descreva o conflito e peça uma decisão. Não escolha silenciosamente.

## Fontes canônicas

- Planejamento e progresso: task-board.md.
- Regras operacionais: .ai/README.md e .ai/rules.
- Arquitetura permanente: docs/adr e docs/architecture.
- Segurança e pagamentos: docs/security e docs/payments.
- Implementação visual: .ai/rules/06-design-system.md, .ai/rules/12-ui-ux-seo-and-mobile.md e tokens em resources/css/tokens.css.

## Fluxo obrigatório

1. Identifique os arquivos, contratos, rotas, migrations, testes e consumidores afetados.
2. Leia as regras de domínio aplicáveis no índice .ai/README.md.
3. Localize a tarefa no task-board.md e atualize seu estado.
4. Apresente um plano curto e altere apenas o escopo aprovado.
5. Faça mudanças pequenas, reversíveis e sem reescrever módulos não relacionados.
6. Execute os testes e verificações definidos em .ai/rules/09-testing-and-quality.md.
7. Informe arquivos alterados, comportamento preservado, testes executados e pendências.

## Invariantes não negociáveis

- Nunca inventar endpoints, tabelas, métricas, permissões ou integrações.
- Nunca enviar credenciais, tokens privados, PAN ou CVV ao navegador.
- Nunca aprovar pagamento por simulação em ambiente de produção.
- Nunca armazenar documentos pessoais em disco público.
- Toda operação de negócio deve possuir tenant resolvido e autorizado.
- Autenticação não substitui autorização: rotas administrativas exigem papel e permissão.
- Queries, cache, filas, arquivos, eventos e unicidades devem ser isolados por tenant.
- Não usar dados fictícios como fallback silencioso em fluxos reais.
- Ao modernizar um módulo, remover mocks, métricas simuladas, personas e imagens de demonstração do caminho de produção. Sem contrato real tenant-scoped, o recurso deve exibir estado indisponível e permanecer no task board; nunca simular funcionamento.
- Não expor exceções, stack traces ou respostas integrais de fornecedores ao cliente.
- Não criar dependências entre a loja pública e endpoints administrativos.
- Não mover ou renomear arquivos públicos sem atualizar consumidores e testes.
- Não adicionar scripts temporários, transcrições, dumps, segredos ou arquivos gerados ao Git.

## Convenções gerais

- Produto, documentação e mensagens de interface: português do Brasil.
- Nomes técnicos novos: inglês consistente. Não renomear legado em massa sem ADR e plano de migração.
- Datas em UTC no armazenamento; formatação no fuso do tenant na apresentação.
- Valores monetários com decimal e moeda explícita; nunca float em cálculos financeiros.
- IDs públicos sensíveis devem usar UUID/ULID ou identificador opaco.
- Controllers devem ser finos; regras de negócio ficam em Actions/Services de domínio.
- Estados de negócio devem usar enums e transições explícitas.

## Definition of Done

Uma alteração só está concluída quando a tarefa correspondente foi atualizada no task-board, possui autorização correta, isolamento por tenant quando aplicável, validação de entrada, tratamento de erro seguro, testes relevantes, documentação atualizada e nenhuma regressão conhecida.

## Coordenação entre agentes

- Antes de iniciar, verifique o handoff mais recente em `.ai/agent-handoff.md` e confirme branch, escopo, estado do board e riscos abertos.
- Um item só recebe `[x]` no board com evidência verificável: comando e resultado, URL de execução/PR quando aplicável, ou referência ao teste criado. Configurar um arquivo não comprova a execução.
- Enquanto algum check obrigatório estiver vermelho, a tarefa fica `[~]` ou `[!]`; não a marque como concluída.
- Mudanças normais entram por branch e pull request. Não faça push direto em `main`; exceções exigem autorização explícita do responsável e registro no handoff.
- Antes de passar o trabalho a outra IA, atualize o handoff com os campos obrigatórios, incluindo tudo que não foi verificado.
- Merge só é permitido após os checks obrigatórios atuais do PR estarem verdes e não houver bloqueio de segurança, tenancy ou pagamento.

## Matriz de testes por impacto

- Documentação, handoff, regras de IA e task board: revisão do diff e links; não executar CI completo, salvo quando a própria regra de workflow for alterada.
- Backend, API, migrations, modelos ou regras de domínio: executar o workflow **Tests** e testes específicos afetados.
- Frontend, build, rotas SPA ou componentes: executar **Tests**; adicionar E2E apenas quando o fluxo de usuário puder mudar.
- Checkout, login, autorização de navegador ou jornada crítica: executar **E2E Tests** além dos testes unitários/feature afetados.
- Workflows, dependências, permissões ou segurança: executar o workflow alterado e registrar seu link no handoff.

Nunca substitua um teste necessário por conveniência; reduza somente checks que não cobrem o risco da alteração.
