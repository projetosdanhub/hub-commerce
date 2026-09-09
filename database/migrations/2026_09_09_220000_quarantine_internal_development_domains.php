<?php

use App\Models\TenantDomain;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        TenantDomain::query()
            ->where('kind', 'CUSTOM')
            ->orderBy('id')
            ->each(function (TenantDomain $domain): void {
                if (! TenantDomain::isInternalDevelopmentHost($domain->domain)) {
                    return;
                }

                $domain->forceFill([
                    'kind' => 'INTERNAL',
                    'status' => 'INTERNAL',
                    'is_primary' => false,
                ])->save();
            });
    }

    public function down(): void
    {
        // Não reclassificar automaticamente dados técnicos antigos como domínios do lojista.
    }
};
