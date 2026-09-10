<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Consolida a tabela legada `categories` no agregado canônico
     * `categorias`. A tabela antiga não possui relações de domínio e não é
     * referenciada por produtos; a migração preserva o registro já existente
     * em `categorias` quando ambos tiverem o mesmo tenant e slug.
     */
    public function up(): void
    {
        if (! Schema::hasTable('categories')) {
            return;
        }

        $this->assertRequiredSchema();

        DB::transaction(function (): void {
            DB::table('categories')
                ->orderBy('id')
                ->eachById(function (object $legacy): void {
                    $tenantId = $legacy->tenant_id ?? null;
                    $nome = trim((string) ($legacy->nome ?? ''));

                    if ($tenantId === null || $nome === '') {
                        throw new LogicException('A consolidação de categorias exige tenant_id e nome em todos os registros legados.');
                    }

                    $slug = Str::slug($nome) ?: 'categoria-'.$legacy->id;
                    $existing = DB::table('categorias')
                        ->where('tenant_id', $tenantId)
                        ->where('slug', $slug)
                        ->exists();

                    // O registro canônico é mais completo e tem precedência
                    // em uma colisão semântica de tenant + slug.
                    if ($existing) {
                        return;
                    }

                    $status = in_array(strtoupper((string) ($legacy->status ?? '')), ['ATIVA', 'ATIVO'], true)
                        ? 'ATIVO'
                        : 'INATIVO';

                    DB::table('categorias')->insert([
                        'tenant_id' => $tenantId,
                        'nome' => $nome,
                        'slug' => $slug,
                        'descricao' => null,
                        'img' => null,
                        'ativo' => $status === 'ATIVO',
                        'status' => $status,
                        'created_at' => $legacy->created_at ?? now(),
                        'updated_at' => $legacy->updated_at ?? now(),
                    ]);
                });
        });

        Schema::drop('categories');
    }

    /**
     * A transferência mescla registros quando existe o mesmo tenant + slug.
     * Por isso, uma reversão automática poderia recriar dados divergentes ou
     * apagar informação canônica; a correção segura é uma migração futura ou
     * a restauração do backup anterior ao deploy.
     */
    public function down(): void
    {
        throw new LogicException('A consolidação de categories para categorias não pode ser revertida automaticamente. Restaure o backup anterior ao deploy ou crie uma migração corretiva.');
    }

    private function assertRequiredSchema(): void
    {
        foreach (['tenant_id', 'nome', 'status'] as $column) {
            if (! Schema::hasColumn('categories', $column)) {
                throw new LogicException("A tabela legada categories não possui a coluna obrigatória {$column}.");
            }
        }

        foreach (['tenant_id', 'nome', 'slug', 'descricao', 'img', 'ativo', 'status'] as $column) {
            if (! Schema::hasColumn('categorias', $column)) {
                throw new LogicException("A tabela canônica categorias não possui a coluna obrigatória {$column}.");
            }
        }
    }
};
