<?php

namespace Tests\Unit\Support\Http;

use App\Support\Http\Pagination;
use Illuminate\Http\Request;
use Tests\TestCase;

class PaginationTest extends TestCase
{
    public function test_it_applies_default_minimum_and_maximum_limits(): void
    {
        $this->assertSame(15, Pagination::perPage(Request::create('/', 'GET'), 15));
        $this->assertSame(1, Pagination::perPage(Request::create('/', 'GET', ['limit' => 0]), 15));
        $this->assertSame(100, Pagination::perPage(Request::create('/', 'GET', ['limit' => 999]), 15));
    }
}
