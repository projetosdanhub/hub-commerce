<?php

namespace App\Domain\PlatformBilling;

use App\Models\PlatformInvoice;

final class TenantBillingPolicy
{
    public const ACTIVE = 'ACTIVE';

    public const GRACE = 'GRACE';

    public const RESTRICTED = 'RESTRICTED';

    public const SUSPENDED = 'SUSPENDED';

    public function statusFor(?PlatformInvoice $oldestOpenInvoice): string
    {
        if ($oldestOpenInvoice === null || $oldestOpenInvoice->due_at === null) {
            return self::ACTIVE;
        }

        if ($oldestOpenInvoice->due_at->isFuture()) {
            return self::ACTIVE;
        }

        if ($oldestOpenInvoice->due_at->copy()->addDays(3)->isFuture()) {
            return self::GRACE;
        }

        if ($oldestOpenInvoice->due_at->copy()->addDays(10)->isFuture()) {
            return self::RESTRICTED;
        }

        return self::SUSPENDED;
    }
}
