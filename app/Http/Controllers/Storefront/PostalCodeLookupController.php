<?php

namespace App\Http\Controllers\Storefront;

use App\Domain\Shipping\BrazilianPostalCodeLookup;
use App\Http\Controllers\Controller;
use DomainException;
use Illuminate\Http\JsonResponse;

class PostalCodeLookupController extends Controller
{
    public function show(string $postalCode, BrazilianPostalCodeLookup $postalCodes): JsonResponse
    {
        try {
            return response()->json([
                'data' => $postalCodes->lookup($postalCode),
            ]);
        } catch (DomainException $exception) {
            return response()->json([
                'code' => 'POSTAL_CODE_UNAVAILABLE',
                'message' => $exception->getMessage(),
            ], 422);
        }
    }
}
