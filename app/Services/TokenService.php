<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class TokenService
{
    protected int $ttl; // in minutes

    public function __construct()
    {
        $this->ttl = 60; // token valid for 60 minutes
    }

    public function generateToken(string $context = 'default'): string
    {
        $token = Str::random(64);

        // Store token in cache with optional context (or persist in DB)
        Cache::put("custom_token_{$context}", $token, now()->addMinutes($this->ttl));

        return $token;
    }

    public function validateToken(string $token, string $context = 'default'): bool
    {
        $cachedToken = Cache::get("custom_token_{$context}");

        return $cachedToken === $token;
    }
}
