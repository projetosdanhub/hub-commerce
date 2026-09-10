<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * @var list<string>
     */
    private array $delegable = [
        'platform.tenants.view',
        'platform.tenants.manage',
        'platform.billing.view',
        'platform.billing.manage',
        'platform.team.view',
        'platform.team.manage',
        'platform.roles.view',
        'platform.audit.view',
    ];

    public function up(): void
    {
        // Somente superadmins possuem platform.roles.manage; por isso a
        // delegação abaixo continua limitada ao operador máximo da plataforma.
        DB::table('permissions')
            ->whereIn('key', $this->delegable)
            ->update(['is_delegable' => true, 'updated_at' => now()]);
    }

    public function down(): void
    {
        DB::table('permissions')
            ->whereIn('key', $this->delegable)
            ->update(['is_delegable' => false, 'updated_at' => now()]);
    }
};
