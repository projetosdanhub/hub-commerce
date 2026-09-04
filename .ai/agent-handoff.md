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

### 2026-09-04 — Codex
- Objetivo e escopo: encerrar BASE-012, BASE-013 e BASE-014; remover o submódulo de UI quebrado; padronizar handoff e CI.
- Branch e commit: `baseline/close-quality-gates`, código validado em `ef093924bf65543433bfbf4a26cf289b4855cc5b`.
- Task board: BASE-012 [x], BASE-013 [x], BASE-014 [x]. QA-001 a QA-011 foram corrigidos para não declarar como concluído o que não possui evidência.
- Arquivos alterados: limites de paginação, CustomerController, README, regras de IA, workflows, Playwright, board e testes associados.
- Evidências: [Tests #223](https://github.com/projetosdanhub/hub-commerce/actions/runs/33868888328), [E2E #49](https://github.com/projetosdanhub/hub-commerce/actions/runs/33868888334) e [Security #49](https://github.com/projetosdanhub/hub-commerce/actions/runs/33868888326) concluíram com sucesso.
- Riscos, bloqueios e itens não verificados: QA-002/004/008 possuem dívida legada explicitamente registrada; QA-007, QA-009 e QA-010 não foram falsamente concluídos; SEC-002 e QA-011 dependem de evidência externa.
- Merge concluído: PR #19 integrado ao `main` no squash commit `80914396530fb11ed18f751dfb9cf23dc52f11e9`.
- Próxima ação única: iniciar UI-001 quando o responsável confirmar o escopo visual.
