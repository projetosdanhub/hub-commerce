# Handoff entre agentes de IA

Este arquivo mantém a continuidade operacional entre KIA, Codex, Claude, Gemini e qualquer outro agente autorizado. Atualize-o no mesmo PR da mudança relevante; ele não substitui o histórico do Git nem o `task-board.md`.

## Estado atual

- **Objetivo:** concluir a baseline de qualidade antes de iniciar UI/UX.
- **Branch de trabalho:** `baseline/close-quality-gates`.
- **Commit inicial:** `924d3c614f46e3b2e37903228788a7ea6e3dc17b` (`main`).
- **Tarefas afetadas:** BASE-012, BASE-013, BASE-014 e QA-001 a QA-011.
- **Próxima ação:** executar todos os checks do PR e registrar os resultados antes do merge.

## Modelo obrigatório

Copie este bloco para cada handoff relevante:

```md
### AAAA-MM-DD — <agente>
- Objetivo e escopo:
- Branch e commit:
- Task board: <ID> <[ ]/[~]/[x]/[!]> — motivo:
- Arquivos alterados:
- Evidências: <comando/executado + resultado; URL de run/PR quando existir>
- Riscos, bloqueios e itens não verificados:
- Próxima ação única:
```

## Regras de interpretação

1. `task-board.md` é a fonte de status; o handoff explica a evidência que sustenta o status.
2. `[x]` exige código, teste adequado e execução verde; um placeholder, um arquivo de configuração ou uma declaração não bastam.
3. `[!]` é obrigatório para dependências externas sem prova verificável, como proteção de branch, permissões e rotação de segredos.
4. Nunca declare um teste, build, deploy ou configuração externa como concluído sem registrar a evidência correspondente.
5. Outro agente deve ler este arquivo, `AGENTS.md`, `.ai/README.md` e as regras específicas antes de modificar o repositório.
