<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CustomerSensitiveDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'uploaded_by',
        'path',
        'original_name',
        'mime_type',
    ];

    protected $hidden = ['path'];

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
