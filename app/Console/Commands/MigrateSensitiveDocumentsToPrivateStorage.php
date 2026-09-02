<?php

namespace App\Console\Commands;

use App\Models\Carrier;
use App\Models\CustomerAuditLog;
use App\Models\CustomerSensitiveDocument;
use App\Models\Order;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class MigrateSensitiveDocumentsToPrivateStorage extends Command
{
    protected $signature = 'security:migrate-private-documents {--dry-run}';
    protected $description = 'Move documentos sensiveis do disco publico para o disco privado.';

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $moved = 0;

        Carrier::query()->orderBy('id')->each(function (Carrier $carrier) use ($dryRun, &$moved): void {
            foreach (['document_rg_front', 'document_rg_back', 'document_cnh'] as $field) {
                if ($this->move($carrier->{$field}, $dryRun)) {
                    $moved++;
                }
            }
        });

        Order::query()->whereNotNull('romaneio_url')->orderBy('id')->each(function (Order $order) use ($dryRun, &$moved): void {
            if ($this->move($order->romaneio_url, $dryRun)) {
                $moved++;
            }
        });

        CustomerAuditLog::query()
            ->where('detalhes', 'like', '%Documento arquivado (Ref:%')
            ->orderBy('id')
            ->each(function (CustomerAuditLog $log) use ($dryRun, &$moved): void {
                if (! preg_match('/Documento arquivado \(Ref: ([^)]+)\)/', (string) $log->detalhes, $matches)) {
                    return;
                }

                $path = $matches[1];
                if (! $this->move($path, $dryRun)) {
                    return;
                }

                if (! $dryRun) {
                    CustomerSensitiveDocument::firstOrCreate([
                        'customer_id' => $log->cliente_id,
                        'path' => $path,
                    ], [
                        'uploaded_by' => $log->admin_id,
                        'original_name' => basename($path),
                        'mime_type' => 'application/octet-stream',
                    ]);

                    $log->detalhes = 'Documento legado migrado para armazenamento privado.';
                    $log->save();
                }

                $moved++;
            });

        $this->info(($dryRun ? 'Simulacao: ' : '')."{$moved} arquivo(s) elegiveis.");

        return self::SUCCESS;
    }

    private function move(?string $path, bool $dryRun): bool
    {
        if (! $path || Storage::disk('local')->exists($path)) {
            return false;
        }

        if (! Storage::disk('public')->exists($path)) {
            $this->warn("Arquivo nao encontrado: {$path}");

            return false;
        }

        if (! $dryRun) {
            Storage::disk('local')->put($path, Storage::disk('public')->get($path));
            Storage::disk('public')->delete($path);
        }

        return true;
    }
}
