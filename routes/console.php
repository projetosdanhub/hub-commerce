<?php

use App\Domain\ProviderConnections\MelhorEnvioTokenRefreshService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');


Schedule::command('billing:reconcile-tenants')
    ->everyFifteenMinutes()
    ->withoutOverlapping()
    ->onOneServer();

Schedule::call(fn (): int => app(MelhorEnvioTokenRefreshService::class)->refreshDue())
    ->hourly()
    ->withoutOverlapping()
    ->onOneServer();
