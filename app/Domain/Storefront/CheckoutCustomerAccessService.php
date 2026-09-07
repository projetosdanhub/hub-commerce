<?php

namespace App\Domain\Storefront;

use App\Models\StorefrontCustomer;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

final class CheckoutCustomerAccessService
{
    /**
     * @param  array{name: string, email: string, password: string}  $attributes
     */
    public function createOrAuthenticate(array $attributes): StorefrontCustomer
    {
        $email = mb_strtolower(trim($attributes['email']));

        return DB::transaction(function () use ($attributes, $email): StorefrontCustomer {
            try {
                $customer = StorefrontCustomer::query()->firstOrCreate(
                    ['email' => $email],
                    [
                        'name' => trim($attributes['name']),
                        'password' => $attributes['password'],
                        'status' => 'ACTIVE',
                    ],
                );
            } catch (QueryException $exception) {
                $customer = StorefrontCustomer::query()
                    ->where('email', $email)
                    ->first();

                if ($customer === null) {
                    throw $exception;
                }
            }

            if ($customer->wasRecentlyCreated) {
                return $customer;
            }

            if (! $customer->isActive() || ! Hash::check($attributes['password'], $customer->password)) {
                throw new AuthenticationException('Não foi possível validar a conta.');
            }

            return $customer;
        });
    }
}
