<?php

namespace App\Console\Commands;

use App\Domain\PlatformBilling\TenantBillingReconciler;
use App\Models\Tenant;
use Illuminate\Console\Command;

class ReconcileTenantBillingCommand extends Command
{
    protected $signature = 'billing:reconcile-tenants';

    protected $description = 'Reconcilia estados de cobrança dos tenants a partir de faturas confirmadas';

    public function handle(TenantBillingReconciler $reconciler): int
    {
        Tenant::query()->select('id')->orderBy('id')->each(
            fn (Tenant $tenant) => $reconciler->reconcile((int) $tenant->getKey()),
        );

        $this->info('Billing dos tenants reconciliado.');

        return self::SUCCESS;
    }
}
