<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Database\Migrations\Migrator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Throwable;

class DatabasePreflight extends Command
{
    private const FISCAL_FIELDS_MIGRATION = '2026_08_24_165409_add_fiscal_fields_to_products_table';

    private const FISCAL_CORRECTION_MIGRATION = '2026_08_24_175459_add_missing_fiscal_fields_to_produtos_table';

    /**
     * @var list<string>
     */
    private const LEGACY_CORE_TABLES = ['users', 'produtos'];

    protected $signature = 'database:preflight
        {--json : Exibe o relatório em JSON para automação}';

    protected $description = 'Valida se uma base existente pode receber migrations sem reconciliar schema automaticamente.';

    public function handle(): int
    {
        try {
            DB::connection()->getPdo();
        } catch (Throwable) {
            return $this->renderReport([
                'status' => 'blocked',
                'pending_migrations' => 0,
                'blockers' => ['Não foi possível conectar ao banco configurado.'],
                'warnings' => [],
            ]);
        }

        $blockers = [];
        $warnings = [];
        $hasMigrationRepository = Schema::hasTable('migrations');
        $existingCoreTables = array_values(array_filter(
            self::LEGACY_CORE_TABLES,
            static fn (string $table): bool => Schema::hasTable($table),
        ));

        if (! $hasMigrationRepository) {
            if ($existingCoreTables !== []) {
                $blockers[] = 'Foram encontradas tabelas de negócio sem histórico de migrations. Não execute migrations automáticas antes de reconciliar o histórico com backup validado.';
            } else {
                $warnings[] = 'A base está vazia. Use o fluxo de instalação inicial, não o de atualização de uma base existente.';
            }

            return $this->renderReport([
                'status' => $blockers === [] ? 'ready' : 'blocked',
                'pending_migrations' => 0,
                'blockers' => $blockers,
                'warnings' => $warnings,
            ]);
        }

        $ran = DB::table('migrations')->orderBy('migration')->pluck('migration')->all();
        $available = array_keys(app(Migrator::class)->getMigrationFiles([
            database_path('migrations'),
        ]));
        $unknownMigrations = array_values(array_diff($ran, $available));

        if ($unknownMigrations !== []) {
            $blockers[] = 'O histórico contém migrations que não existem mais no código. Reconcilie o release antes de usar rollback.';
        }

        if (Schema::hasTable('produtos')) {
            $hasGtin = Schema::hasColumn('produtos', 'gtin');
            $hasUnit = Schema::hasColumn('produtos', 'unidade_medida');

            if ($hasGtin && ! in_array(self::FISCAL_FIELDS_MIGRATION, $ran, true)) {
                $blockers[] = 'A coluna produtos.gtin existe sem o registro da migration fiscal correspondente.';
            }

            if ($hasUnit && ! in_array(self::FISCAL_CORRECTION_MIGRATION, $ran, true)) {
                $blockers[] = 'A coluna produtos.unidade_medida existe sem o registro da migration corretiva correspondente.';
            }

            if (in_array(self::FISCAL_CORRECTION_MIGRATION, $ran, true) && ! $hasUnit) {
                $blockers[] = 'A migration corretiva fiscal consta no histórico, mas produtos.unidade_medida não existe.';
            }
        }

        $report = [
            'status' => $blockers === [] ? 'ready' : 'blocked',
            'pending_migrations' => count(array_diff($available, $ran)),
            'blockers' => $blockers,
            'warnings' => $warnings,
        ];

        if ($report['pending_migrations'] > 0) {
            $report['warnings'][] = 'Há migrations pendentes. Revise o plano com --pretend após confirmar backup e restauração.';
        }

        return $this->renderReport($report);
    }

    /**
     * @param array{status: string, pending_migrations: int, blockers: list<string>, warnings: list<string>} $report
     */
    private function renderReport(array $report): int
    {
        if ($this->option('json')) {
            $this->line((string) json_encode($report, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
        } else {
            $this->line('Status: '.$report['status']);
            $this->line('Migrations pendentes: '.$report['pending_migrations']);

            foreach ($report['warnings'] as $warning) {
                $this->warn($warning);
            }

            foreach ($report['blockers'] as $blocker) {
                $this->error($blocker);
            }
        }

        return $report['status'] === 'ready' ? self::SUCCESS : self::FAILURE;
    }
}
