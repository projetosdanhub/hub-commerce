<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CrmSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'permite_cadastro',
        'login_apenas_convite',
        'aprovar_comentarios',
        'bloquear_fora_do_pais',
    ];
}