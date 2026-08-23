<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StorefrontConfig extends Model
{
    protected $fillable = ['layout_blocks'];

    protected function casts(): array
    {
        return [
            'layout_blocks' => 'array',
        ];
    }
}