<?php

namespace App\Models;

use App\Domain\Tenancy\Concerns\BelongsToTenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MenuConfig extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = ['nome'];

    public function items()
    {
        return $this->hasMany(NavigationMenu::class, 'menu_config_id')->orderBy('ordem');
    }
}
