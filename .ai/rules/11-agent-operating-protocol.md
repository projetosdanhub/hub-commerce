# Protocolo da KIA e agentes

## Antes de editar

- Confirmar objetivo, escopo e branch.
- Ler AGENTS.md e regras aplicáveis.
- Inspecionar o arquivo alvo e consumidores diretos.
- Identificar riscos de segurança, tenant, dados, pagamentos e compatibilidade.
- Se a solicitação conflitar com uma invariante, parar e explicar.

## Durante

- Não ampliar escopo silenciosamente.
- Não apagar código ou arquivos sem necessidade demonstrada.
- Preservar comportamento válido e registrar dependências de backend.
- Não resolver erro criando mock, endpoint, model ou tabela fictícia.
- Não copiar padrões inseguros do legado.
- Preferir componentes e serviços canônicos.
- Manter uma mudança legível por vez.

## Handoff obrigatório

Quando outra IA puder continuar o trabalho, atualizar `.ai/agent-handoff.md` no mesmo conjunto de mudanças. O handoff deve informar: objetivo, branch e commit, IDs e estados do board, arquivos alterados, comandos e resultados, riscos/bloqueios, e a próxima ação única. Nunca omitir falha, teste não executado ou controle externo sem evidência.

## Depois

Entregar sempre:
1. resultado;
2. arquivos alterados;
3. regras preservadas;
4. testes e comandos executados;
5. riscos ou itens não verificados;
6. próximo passo recomendado;
7. link ou identificador da evidência de CI/PR quando houver.

Não afirmar que compilou, testou, publicou ou protegeu algo sem evidência da execução.
