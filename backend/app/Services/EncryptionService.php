<?php

namespace App\Services;

class EncryptionService
{
    /**
     * Encrypt an API key
     */
    public function encryptKey(string $key): string
    {
        return encrypt($key);
    }

    /**
     * Decrypt an API key
     */
    public function decryptKey(string $encryptedKey): string
    {
        return decrypt($encryptedKey);
    }
}
