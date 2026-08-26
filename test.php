<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
try {
    App\Models\CarrierAuditLog::with('admin:id,name,role')->orderBy('created_at', 'desc')->get();
    echo "OK";
} catch (\Exception $e) {
    echo $e->getMessage();
}
