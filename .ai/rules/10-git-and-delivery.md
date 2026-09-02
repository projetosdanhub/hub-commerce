# Git e entrega

- Trabalhar em branch curta e descritiva; não alterar main diretamente.
- Commits pequenos, atômicos e com mensagem explicando intenção.
- Separar refatoração mecânica de mudança de comportamento.
- Não misturar segurança, redesign e migração de banco no mesmo commit.
- Pull request informa escopo, risco, migrations, rollback, screenshots e testes.
- Mudança crítica exige revisão humana.
- Não fazer force push em branch compartilhada.
- Não versionar .env, credenciais, dumps, transcrições, arquivos temporários, build ou dados reais.
- Dependências só mudam com lockfile atualizado e auditoria.
- Release de banco deve considerar compatibilidade expand/migrate/contract.
- Toda implantação precisa de backup, health check e plano de rollback.
- Produção nunca executa Vite dev, XAMPP ou php artisan serve.
