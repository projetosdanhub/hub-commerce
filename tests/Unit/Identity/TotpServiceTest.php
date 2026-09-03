<?php

namespace Tests\Unit\Identity;

use App\Domain\Identity\TotpService;
use PHPUnit\Framework\TestCase;

class TotpServiceTest extends TestCase
{
    public function test_validates_the_rfc_6238_sha1_vector(): void
    {
        $service = new TotpService();
        $secret = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';

        $this->assertTrue($service->verify($secret, '287082', 59, 0));
        $this->assertFalse($service->verify($secret, '287083', 59, 0));
    }
}
