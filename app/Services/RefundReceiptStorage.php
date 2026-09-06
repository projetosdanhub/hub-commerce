<?php

namespace App\Services;

use App\Domain\Tenancy\TenantStorage;
use App\Models\Order;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

final class RefundReceiptStorage
{
    public function __construct(
        private readonly TenantStorage $tenantStorage,
    ) {
    }

    /**
     * @return array{extension: 'jpg'|'png', contents: string}
     */
    public function sanitize(UploadedFile $file): array
    {
        $mime = $file->getMimeType();
        $extension = match ($mime) {
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            default => throw ValidationException::withMessages([
                'comprovantes' => 'Envie somente imagens JPEG ou PNG válidas.',
            ]),
        };

        if (! $file->isValid() || ! function_exists('imagecreatefromstring')) {
            throw ValidationException::withMessages([
                'comprovantes' => 'Não foi possível higienizar a imagem enviada.',
            ]);
        }

        $contents = file_get_contents($file->getRealPath());

        if ($contents === false) {
            throw ValidationException::withMessages([
                'comprovantes' => 'Não foi possível ler a imagem enviada.',
            ]);
        }

        $image = imagecreatefromstring($contents);

        if ($image === false) {
            throw ValidationException::withMessages([
                'comprovantes' => 'A imagem enviada não é válida.',
            ]);
        }

        try {
            ob_start();
            $written = $extension === 'jpg'
                ? imagejpeg($image, null, 90)
                : $this->writePng($image);
            $sanitized = ob_get_clean();

            if (! $written || ! is_string($sanitized) || $sanitized === '') {
                throw ValidationException::withMessages([
                    'comprovantes' => 'Não foi possível higienizar a imagem enviada.',
                ]);
            }

            return [
                'extension' => $extension,
                'contents' => $sanitized,
            ];
        } finally {
            imagedestroy($image);
        }
    }

    /**
     * @param array{extension: 'jpg'|'png', contents: string} $receipt
     */
    public function store(Order $order, array $receipt): string
    {
        $path = $this->tenantStorage->path(
            'private/orders/'.$order->getKey().'/refunds/'.Str::uuid().'.'.$receipt['extension'],
        );

        Storage::disk('local')->put($path, $receipt['contents']);

        return $path;
    }

    /**
     * @param list<string> $paths
     */
    public function delete(array $paths): void
    {
        Storage::disk('local')->delete(array_values(array_filter($paths)));
    }

    private function writePng(\GdImage $image): bool
    {
        imagealphablending($image, false);
        imagesavealpha($image, true);

        return imagepng($image, null, 6);
    }
}
