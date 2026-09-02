# HUB Commerce — instruções do repositório

Este arquivo se aplica a todo o repositório. KIA, Codex e qualquer agente automatizado devem lê-lo antes de analisar ou alterar código.

## Ordem de autoridade

1. Solicitação explícita do responsável pelo projeto.
2. Este arquivo.
3. Regras específicas em .ai/rules.
4. Decisões aprovadas em docs/adr.
5. Documentação técnica e design-system/MASTER.md.

Em caso de conflito, pare, descreva o conflito e peça uma decisão. Não escolha silenciosamente.

## Fluxo obrigatório

1. Identifique os arquivos, contratos, rotas, migrations, testes e consumidores afetados.
2. Leia as regras de domínio aplicáveis no índice .ai/README.md.
3. Apresente um plano curto e altere apenas o escopo aprovado.
4. Faça mudanças pequenas, reversíveis e sem reescrever módulos não relacionados.
5. Execute os testes e verificações definidos em .ai/rules/09-testing-and-quality.md.
6. Informe arquivos alterados, comportamento preservado, testes executados e pendências.

## Invariantes não negociáveis

- Nunca inventar endpoints, tabelas, métricas, permissões ou integrações.
- Nunca enviar credenciais, tokens privados, PAN ou CVV ao navegador.
- Nunca aprovar pagamento por simulação em ambiente de produção.
- Nunca armazenar documentos pessoais em disco público.
- Toda operação de negócio deve possuir tenant resolvido e autorizado.
- Autenticação não substitui autorização: rotas administrativas exigem papel e permissão.
- Queries, cache, filas, arquivos, eventos e unicidades devem ser isolados por tenant.
- Não usar dados fictícios como fallback silencioso em fluxos reais.
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

Uma alteração só está concluída quando possui autorização correta, isolamento por tenant quando aplicável, validação de entrada, tratamento de erro seguro, testes relevantes, documentação atualizada e nenhuma regressão conhecida.
