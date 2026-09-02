<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;

class GlobalSetting extends Model
{
    use HasFactory;

    protected $fillable = ['group', 'key'];

    protected $hidden = ['value', 'encrypted_value'];

    public function secureValue(): mixed
    {
        if ($this->encrypted_value) {
            return json_decode(
                Crypt::decryptString($this->encrypted_value),
                true,
                512,
                JSON_THROW_ON_ERROR
            );
        }

        $raw = $this->getRawOriginal('value');
        if ($raw === null) {
            return null;
        }

        if (! is_string($raw)) {
            return $raw;
        }

        $decoded = json_decode($raw, true);

        return json_last_error() === JSON_ERROR_NONE ? $decoded : $raw;
    }

    public function setSecureValue(mixed $value): self
    {
        $this->encrypted_value = Crypt::encryptString(json_encode($value, JSON_THROW_ON_ERROR));
        $this->value = null;

        return $this;
    }
}
