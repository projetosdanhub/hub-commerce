<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NavigationMenu extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    public function menuConfig()
    {
        return $this->belongsTo(MenuConfig::class, 'menu_config_id');
    }
}