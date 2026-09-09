<?php

namespace App\Domain\PlatformBilling;

use App\Models\PlatformInvoice;
use App\Models\TenantBillingStatus;
use Illuminate\Support\Facades\DB;

final readonly class TenantBillingReconciler
{
    public function __construct(private TenantBillingPolicy $policy) {}

    public function reconcile(int $tenantId): TenantBillingStatus
    {
        return DB::transaction(function () use ($tenantId): TenantBillingStatus {
            $invoice = PlatformInvoice::query()
                ->where('tenant_id', $tenantId)
                ->whereIn('status', ['OPEN', 'OVERDUE'])
                ->orderBy('due_at')
                ->lockForUpdate()
                ->first();

            $next = $this->policy->statusFor($invoice);
            $status = TenantBillingStatus::query()
                ->where('tenant_id', $tenantId)
                ->lockForUpdate()
                ->firstOrCreate(['tenant_id' => $tenantId], ['status' => TenantBillingPolicy::ACTIVE]);

            if ($status->status === $next) {
                return $status;
            }

            $changes = ['status' => $next];
            if ($next === TenantBillingPolicy::RESTRICTED) {
                $changes['restricted_at'] = now();
            } elseif ($next === TenantBillingPolicy::SUSPENDED) {
                $changes['suspended_at'] = now();
            } elseif ($next === TenantBillingPolicy::ACTIVE) {
                $changes['reactivated_at'] = now();
            }

            $status->forceFill($changes)->save();

            return $status->fresh();
        });
    }
}
