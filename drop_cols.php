<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

Schema::table('produtos', function (Blueprint $table) {
    if (Schema::hasColumn('produtos', 'gtin')) $table->dropColumn('gtin');
    if (Schema::hasColumn('produtos', 'unidade_medida')) $table->dropColumn('unidade_medida');
    if (Schema::hasColumn('produtos', 'icms_perc')) $table->dropColumn('icms_perc');
    if (Schema::hasColumn('produtos', 'ipi_perc')) $table->dropColumn('ipi_perc');
});
echo "Cols dropped\n";
