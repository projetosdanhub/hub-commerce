<?php

namespace App\Domain\Identity;

final class TotpService
{
    private const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

    public function generateSecret(int $length = 32): string
    {
        $bytes = random_bytes((int) ceil($length * 5 / 8));

        return substr($this->encodeBase32($bytes), 0, $length);
    }

    public function verify(string $secret, string $code, ?int $timestamp = null, int $window = 1): bool
    {
        $code = preg_replace('/\s+/', '', $code) ?? '';

        if (! preg_match('/^\d{6}$/', $code)) {
            return false;
        }

        $counter = intdiv($timestamp ?? time(), 30);

        for ($offset = -$window; $offset <= $window; $offset++) {
            if (hash_equals($this->codeAt($secret, $counter + $offset), $code)) {
                return true;
            }
        }

        return false;
    }

    public function provisioningUri(string $issuer, string $accountName, string $secret): string
    {
        $label = rawurlencode($issuer . ':' . $accountName);

        return 'otpauth://totp/' . $label . '?secret=' . rawurlencode($secret)
            . '&issuer=' . rawurlencode($issuer)
            . '&algorithm=SHA1&digits=6&period=30';
    }

    private function codeAt(string $secret, int $counter): string
    {
        $binarySecret = $this->decodeBase32($secret);
        $hash = hash_hmac('sha1', pack('N*', 0, $counter), $binarySecret, true);
        $offset = ord($hash[19]) & 0x0f;
        $binary = ((ord($hash[$offset]) & 0x7f) << 24)
            | ((ord($hash[$offset + 1]) & 0xff) << 16)
            | ((ord($hash[$offset + 2]) & 0xff) << 8)
            | (ord($hash[$offset + 3]) & 0xff);

        return str_pad((string) ($binary % 1_000_000), 6, '0', STR_PAD_LEFT);
    }

    private function encodeBase32(string $value): string
    {
        $buffer = 0;
        $bitsLeft = 0;
        $encoded = '';

        foreach (str_split($value) as $character) {
            $buffer = ($buffer << 8) | ord($character);
            $bitsLeft += 8;

            while ($bitsLeft >= 5) {
                $encoded .= self::ALPHABET[($buffer >> ($bitsLeft - 5)) & 0x1f];
                $bitsLeft -= 5;
            }
        }

        if ($bitsLeft > 0) {
            $encoded .= self::ALPHABET[($buffer << (5 - $bitsLeft)) & 0x1f];
        }

        return $encoded;
    }

    private function decodeBase32(string $value): string
    {
        $value = strtoupper(preg_replace('/[^A-Z2-7]/i', '', $value) ?? '');
        $buffer = 0;
        $bitsLeft = 0;
        $decoded = '';

        foreach (str_split($value) as $character) {
            $position = strpos(self::ALPHABET, $character);

            if ($position === false) {
                throw new \InvalidArgumentException('Segredo TOTP inválido.');
            }

            $buffer = ($buffer << 5) | $position;
            $bitsLeft += 5;

            if ($bitsLeft >= 8) {
                $decoded .= chr(($buffer >> ($bitsLeft - 8)) & 0xff);
                $bitsLeft -= 8;
            }
        }

        return $decoded;
    }
}
