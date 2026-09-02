<?php

namespace App\Models;

use App\Domain\Tenancy\Concerns\BelongsToTenant;

use Illuminate\Database\Eloquent\Model;

class StorefrontConfig extends Model
{
    use BelongsToTenant;

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