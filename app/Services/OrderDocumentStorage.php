<?php

namespace App\Services;

use App\Domain\Tenancy\TenantStorage;
use App\Models\Order;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

final class OrderDocumentStorage
{
    private const TYPES = [
        'payment' => 'payment_receipt',
        'delivery' => 'delivery_receipt',
        'romaneio' => 'romaneio_url',
    ];

    public function __construct(
        private readonly TenantStorage $tenantStorage,
    ) {}

    public function store(Order $order, UploadedFile $file, string $type): string
    {
        $extension = $this->extension($file);
        $path = $this->tenantStorage->path(
            'private/orders/'.$order->getKey().'/documents/'.$type.'/'.Str::uuid().'.'.$extension,
        );

        Storage::disk('local')->putFileAs(
            dirname($path),
            $file,
            basename($path),
        );

        return $path;
    }

    public function fieldFor(string $type): ?string
    {
        return self::TYPES[$type] ?? null;
    }

    public function existingPath(Order $order, string $type): ?string
    {
        $field = $this->fieldFor($type);
        $path = $field === null ? null : $order->{$field};

        return is_string($path) && Storage::disk('local')->exists($path) ? $path : null;
    }

    private function extension(UploadedFile $file): string
    {
        if ($file->isValid() === false || $file->getSize() > 5 * 1024 * 1024) {
            throw ValidationException::withMessages([
                'arquivo' => 'Envie um documento válido de até 5 MB.',
            ]);
        }

        return match ($file->getMimeType()) {
            'application/pdf' => 'pdf',
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            default => throw ValidationException::withMessages([
                'arquivo' => 'Envie somente PDF, JPEG ou PNG válidos.',
            ]),
        };
    }
}
