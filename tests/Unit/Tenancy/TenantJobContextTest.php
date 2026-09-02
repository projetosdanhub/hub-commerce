<?php

namespace Tests\Unit\Tenancy;

use App\Jobs\SendToGa4Job;
use RuntimeException;
use Tests\TestCase;

class TenantJobContextTest extends TestCase
{
    public function test_tracking_job_rejects_unknown_tenant(): void
    {
        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('tenant ausente ou inativo');

        (new SendToGa4Job(
            payload: ['event' => ['name' => 'PageView']],
            ip: '127.0.0.1',
            userAgent: 'PHPUnit',
            destinationId: 1,
            tenantId: 999999,
        ))->handle();
    }
}
