<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PlatformPlan extends Model
{
    use HasFactory;

    protected $fillable = ['code', 'name', 'amount_cents', 'currency', 'interval', 'active'];

    protected function casts(): array
    {
        return ['active' => 'boolean'];
    }
}
