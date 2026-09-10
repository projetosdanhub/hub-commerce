<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('global_settings', function (Blueprint $table) {
            $table->longText('encrypted_value')->nullable()->after('value');
        });

        DB::table('global_settings')
            ->whereNotNull('value')
            ->orderBy('id')
            ->eachById(function ($setting): void {
                $decoded = is_string($setting->value)
                    ? json_decode($setting->value, true)
                    : $setting->value;

                if (json_last_error() !== JSON_ERROR_NONE) {
                    $decoded = $setting->value;
                }

                DB::table('global_settings')
                    ->where('id', $setting->id)
                    ->update([
                        'value' => null,
                        'encrypted_value' => Crypt::encryptString(json_encode($decoded, JSON_THROW_ON_ERROR)),
                    ]);
            });
    }

    public function down(): void
    {
        DB::table('global_settings')
            ->whereNotNull('encrypted_value')
            ->orderBy('id')
            ->eachById(function ($setting): void {
                $value = json_decode(
                    Crypt::decryptString($setting->encrypted_value),
                    true,
                    512,
                    JSON_THROW_ON_ERROR
                );

                DB::table('global_settings')
                    ->where('id', $setting->id)
                    ->update(['value' => json_encode($value, JSON_THROW_ON_ERROR)]);
            });

        Schema::table('global_settings', function (Blueprint $table) {
            $table->dropColumn('encrypted_value');
        });
    }
};
