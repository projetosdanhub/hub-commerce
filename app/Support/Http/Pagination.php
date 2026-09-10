<?php

namespace App\Support\Http;

use Illuminate\Http\Request;

final class Pagination
{
    public const MAX_PER_PAGE = 100;

    public static function perPage(Request $request, int $default): int
    {
        return min(max($request->integer('limit', $default), 1), self::MAX_PER_PAGE);
    }
}
