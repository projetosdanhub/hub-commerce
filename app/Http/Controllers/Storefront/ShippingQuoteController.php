<?php

namespace App\Http\Controllers\Storefront;

use App\Domain\Orders\CheckoutFingerprint;
use App\Domain\Orders\CheckoutPricingService;
use App\Domain\Orders\CheckoutShippingQuoteIssuer;
use App\Domain\Shipping\CheckoutPackageBuilder;
use App\Domain\Shipping\MelhorEnvioRateAdapter;
use App\Http\Controllers\Controller;
use App\Models\MelhorEnvioSetting;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;

class ShippingQuoteController extends Controller
{
    public function store(Request $request, CheckoutPricingService $pricing, CheckoutFingerprint $fingerprint, CheckoutPackageBuilder $packages, MelhorEnvioRateAdapter $adapter, CheckoutShippingQuoteIssuer $issuer)
    {
        $data = $request->validate(['items'=>'required|array|min:1','items.*.id'=>'required|integer','items.*.quantity'=>'required|integer|min:1','address.cep'=>'required|string','address.rua'=>'required|string','address.numero'=>'required|string','address.bairro'=>'required|string','address.cidade'=>'required|string','address.uf'=>'required|string','address.complemento'=>'nullable|string']);
        try {
            $priced=$pricing->priceItems($data['items']);
            $package=$packages->build(collect($priced['items']));
            $config=MelhorEnvioSetting::query()->first();
            if ($config === null) throw new \DomainException('A cotação de frete não está configurada para esta loja.');
            $rates=$adapter->calculate($config,$data['address']['cep'],$package,number_format($priced['product_subtotal_cents']/100,2,'.',''));
            $quotes=$issuer->issue($fingerprint->cart($data['items']),$fingerprint->destination($data['address']),$rates,CarbonImmutable::now()->addMinutes(15));
            return response()->json(['data'=>collect($quotes)->map(fn($quote)=>['token'=>$quote->token,'service_code'=>$quote->service_code,'shipping_cents'=>$quote->shipping_cents,'estimated_delivery_days'=>$quote->estimated_delivery_days,'expires_at'=>$quote->expires_at->toIso8601String()])->values()]);
        } catch (\DomainException $e) {
            return response()->json(['code'=>'SHIPPING_QUOTE_UNAVAILABLE','message'=>$e->getMessage()], 422);
        } }
    }
}
