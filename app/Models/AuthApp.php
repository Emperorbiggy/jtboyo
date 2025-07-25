<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuthApp extends Model
{
    protected $fillable = [
        'app_name',
        'token',
        'whitelisted_ips',
        'request_count',
        'status',
        'last_accessed_at',
        'description',
    ];

    protected $casts = [
        'whitelisted_ips' => 'array',
        'last_accessed_at' => 'datetime',
        'status' => 'boolean',
    ];
}
