# COMANDO_MASTER_REFATORACAO.md

Use este comando em qualquer módulo. Troque apenas o arquivo alvo e o arquivo específico de refatoração.

---

Refatore completamente o arquivo/módulo:

AdminPixels.jsx

Siga obrigatoriamente as especificações específicas deste módulo:

ADMIN_PIXELS_REFACTOR.md

Use como diretriz mestre de arquitetura, componentes, comportamento e padrão de refatoração:

MASTER_ADMIN_UI_UX_REFACTOR.md

E siga obrigatoriamente o design system e as diretrizes visuais do projeto:

ui-ux-guidelines.md

Antes de alterar o código, analise o arquivo alvo e **todos os componentes, hooks, services, schemas, stores, APIs e dependências diretamente relacionados ao módulo**, compreendendo e preservando integralmente regras de negócio, contratos, validações, permissões, segurança e integrações existentes.

Depois da análise, **execute a refatoração completa no código real**, seguindo as prioridades do arquivo específico do módulo.

Regras obrigatórias:

- não remover nem alterar regras de negócio existentes;
- não inventar endpoints, APIs, métricas ou dados;
- não substituir funcionalidades válidas por mocks;
- preservar integrações e contratos atuais;
- reutilizar componentes existentes quando fizer sentido;
- criar componentes compartilhados quando o padrão puder ser reutilizado;
- implementar loading, erro, sucesso, vazio e alterações não salvas;
- garantir responsividade e acessibilidade;
- manter o padrão de menu afundado definido nas diretrizes quando houver navegação local;
- ações de salvar devem ter loading/sucesso/erro e não devem fechar a tela automaticamente, salvo regra explícita do módulo;
- diferenciar claramente o que pode ser implementado agora do que depende de backend.

Não quero apenas sugestões, análise ou mock visual.

**Analise, planeje rapidamente e implemente a refatoração completa do módulo.**

Ao finalizar, informe resumidamente:

1. arquivos alterados/criados;
2. principais melhorias implementadas;
3. regras e integrações preservadas;
4. funcionalidades que dependem de backend;
5. riscos ou pendências encontradas.
