<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Http\Requests\Storefront\StoreCheckoutAddressRequest;
use App\Models\StorefrontCustomer;
use App\Models\StorefrontCustomerAddress;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\PersonalAccessToken;

class CheckoutAddressController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $customer = $this->customer($request);

        return response()->json([
            'data' => $customer->addresses()
                ->orderByDesc('is_default')
                ->orderByDesc('updated_at')
                ->get()
                ->map(fn (StorefrontCustomerAddress $address): array => $this->serialize($address))
                ->values(),
        ]);
    }

    public function store(StoreCheckoutAddressRequest $request): JsonResponse
    {
        $customer = $this->customer($request);
        $data = $request->validated();

        $address = DB::transaction(function () use ($customer, $data): StorefrontCustomerAddress {
            $makeDefault = (bool) ($data['is_default'] ?? false);

            if ($makeDefault) {
                $customer->addresses()
                    ->lockForUpdate()
                    ->update(['is_default' => false]);
            }

            return $customer->addresses()->create([
                'label' => $data['label'] ?? null,
                'cep' => $data['cep'],
                'rua' => $data['rua'],
                'numero' => $data['numero'],
                'complemento' => $data['complemento'] ?? null,
                'referencia' => $data['referencia'] ?? null,
                'bairro' => $data['bairro'],
                'cidade' => $data['cidade'],
                'uf' => $data['uf'],
                'is_default' => $makeDefault,
            ]);
        });

        return response()->json([
            'data' => $this->serialize($address),
        ], 201);
    }

    private function customer(Request $request): StorefrontCustomer
    {
        $accessToken = PersonalAccessToken::findToken($request->bearerToken());

        if (
            $accessToken === null
            || $accessToken->tokenable_type !== StorefrontCustomer::class
            || ! $accessToken->can('storefront.checkout')
        ) {
            abort(403);
        }

        $customer = StorefrontCustomer::query()->find($accessToken->tokenable_id);

        if ($customer === null || ! $customer->isActive()) {
            abort(403);
        }

        return $customer;
    }

    /**
     * @return array{id: int, label: string|null, cep: string, rua: string, numero: string, complemento: string|null, referencia: string|null, bairro: string, cidade: string, uf: string, is_default: bool}
     */
    private function serialize(StorefrontCustomerAddress $address): array
    {
        return [
            'id' => (int) $address->getKey(),
            'label' => $address->label,
            'cep' => $address->cep,
            'rua' => $address->rua,
            'numero' => $address->numero,
            'complemento' => $address->complemento,
            'referencia' => $address->referencia,
            'bairro' => $address->bairro,
            'cidade' => $address->cidade,
            'uf' => $address->uf,
            'is_default' => $address->is_default,
        ];
    }
}
