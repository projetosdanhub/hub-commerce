<?php

namespace App\Http\Api;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Throwable;

final class ApiExceptionRenderer
{
    public function render(Throwable $exception, Request $request): JsonResponse
    {
        if ($exception instanceof ValidationException) {
            return ApiResponse::error(
                'VALIDATION_FAILED',
                'Os dados informados são inválidos.',
                422,
                $exception->errors(),
            );
        }

        if ($exception instanceof AuthenticationException) {
            return ApiResponse::error(
                'UNAUTHENTICATED',
                'Autenticação necessária.',
                401,
            );
        }

        if ($exception instanceof AuthorizationException) {
            return ApiResponse::error(
                'FORBIDDEN',
                'Você não possui permissão para esta ação.',
                403,
            );
        }

        if ($exception instanceof ModelNotFoundException) {
            return ApiResponse::error(
                'RESOURCE_NOT_FOUND',
                'Recurso não encontrado.',
                404,
            );
        }

        if ($exception instanceof ThrottleRequestsException) {
            return ApiResponse::error(
                'RATE_LIMITED',
                'Muitas tentativas. Aguarde antes de tentar novamente.',
                429,
            )->withHeaders($exception->getHeaders());
        }

        if ($exception instanceof HttpExceptionInterface) {
            return $this->httpException($exception);
        }

        Log::error('Erro não tratado na API.', [
            'exception' => $exception::class,
            'request_id' => $request->header('X-Request-ID'),
        ]);

        return ApiResponse::error(
            'INTERNAL_ERROR',
            'Ocorreu um erro interno.',
            500,
        );
    }

    private function httpException(HttpExceptionInterface $exception): JsonResponse
    {
        $status = $exception->getStatusCode();
        $codes = [
            400 => 'BAD_REQUEST',
            401 => 'UNAUTHENTICATED',
            403 => 'FORBIDDEN',
            404 => 'RESOURCE_NOT_FOUND',
            405 => 'METHOD_NOT_ALLOWED',
            409 => 'CONFLICT',
            410 => 'RESOURCE_GONE',
            419 => 'SESSION_EXPIRED',
            423 => 'TENANT_UNAVAILABLE',
            429 => 'RATE_LIMITED',
            503 => 'SERVICE_UNAVAILABLE',
        ];
        $messages = [
            400 => 'Requisição inválida.',
            401 => 'Autenticação necessária.',
            403 => 'Você não possui permissão para esta ação.',
            404 => 'Recurso não encontrado.',
            405 => 'Método HTTP não permitido.',
            409 => 'A requisição conflita com o estado atual do recurso.',
            410 => 'O recurso não está mais disponível.',
            419 => 'A sessão expirou.',
            423 => 'Esta loja está temporariamente indisponível.',
            429 => 'Muitas tentativas. Aguarde antes de tentar novamente.',
            503 => 'Serviço temporariamente indisponível.',
        ];

        $code = $codes[$status] ?? ($status >= 500 ? 'INTERNAL_ERROR' : 'HTTP_ERROR');
        $message = $status < 500 && trim($exception->getMessage()) !== ''
            ? $exception->getMessage()
            : ($messages[$status] ?? ($status >= 500 ? 'Ocorreu um erro interno.' : 'Não foi possível concluir a requisição.'));

        return ApiResponse::error($code, $message, $status)
            ->withHeaders($exception->getHeaders());
    }
}
