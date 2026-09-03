<?php

namespace App\Http\Api;

use Illuminate\Http\JsonResponse;

final class ApiResponse
{
    /**
     * @param array<string, mixed> $extra
     */
    public static function success(
        mixed $data = null,
        ?string $message = null,
        int $httpStatus = 200,
        array $extra = [],
    ): JsonResponse {
        $payload = ['status' => 'success'];

        if ($message !== null) {
            $payload['message'] = $message;
        }

        if ($data !== null) {
            $payload['data'] = $data;
        }

        return response()->json(array_merge($payload, $extra), $httpStatus);
    }

    /**
     * @param array<string, mixed> $errors
     * @param array<string, mixed> $extra
     */
    public static function error(
        string $code,
        string $message,
        int $httpStatus,
        array $errors = [],
        array $extra = [],
    ): JsonResponse {
        $payload = [
            'status' => 'error',
            'code' => $code,
            'message' => $message,
        ];

        if ($errors !== []) {
            $payload['errors'] = $errors;
        }

        return response()->json(array_merge($payload, $extra), $httpStatus);
    }
}
