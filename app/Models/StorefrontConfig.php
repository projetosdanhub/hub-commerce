<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StorefrontConfig extends Model
{
    protected $fillable = ['layout_blocks', 'active_menu_id'];

    protected function casts(): array
    {
        return [
            'layout_blocks' => 'array',
        ];
    }

    public function activeMenu()
    {
        return $this->belongsTo(MenuConfig::class, 'active_menu_id');
    }
}