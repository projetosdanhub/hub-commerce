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
        Schema::table('tracking_destinations', function (Blueprint $table) {
            $table->longText('encrypted_credentials')->nullable()->after('credentials');
        });

        DB::table('tracking_destinations')
            ->whereNotNull('credentials')
            ->orderBy('id')
            ->eachById(function ($destination): void {
                $credentials = is_string($destination->credentials)
                    ? (json_decode($destination->credentials, true) ?: [])
                    : (array) $destination->credentials;

                DB::table('tracking_destinations')
                    ->where('id', $destination->id)
                    ->update([
                        'credentials' => null,
                        'encrypted_credentials' => Crypt::encryptString(json_encode($credentials, JSON_THROW_ON_ERROR)),
                    ]);
            });

        DB::table('melhor_envio_settings')
            ->whereNotNull('access_token')
            ->orderBy('id')
            ->eachById(function ($setting): void {
                if (! str_starts_with((string) $setting->access_token, 'eyJpdiI6')) {
                    DB::table('melhor_envio_settings')
                        ->where('id', $setting->id)
                        ->update(['access_token' => Crypt::encryptString($setting->access_token)]);
                }
            });
    }

    public function down(): void
    {
        DB::table('tracking_destinations')
            ->whereNotNull('encrypted_credentials')
            ->orderBy('id')
            ->eachById(function ($destination): void {
                DB::table('tracking_destinations')
                    ->where('id', $destination->id)
                    ->update([
                        'credentials' => Crypt::decryptString($destination->encrypted_credentials),
                    ]);
            });

        Schema::table('tracking_destinations', function (Blueprint $table) {
            $table->dropColumn('encrypted_credentials');
        });

        DB::table('melhor_envio_settings')
            ->whereNotNull('access_token')
            ->orderBy('id')
            ->eachById(function ($setting): void {
                try {
                    $plainText = Crypt::decryptString($setting->access_token);
                } catch (\Throwable) {
                    return;
                }

                DB::table('melhor_envio_settings')
                    ->where('id', $setting->id)
                    ->update(['access_token' => $plainText]);
            });
    }
};
