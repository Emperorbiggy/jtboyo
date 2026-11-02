<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'is_super_admin',
        'permissions',
        'is_active',
    ];

    /** Match the column defaults, so a fresh model counts as active. */
    protected $attributes = [
        'is_super_admin' => false,
        'is_active' => true,
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_super_admin' => 'boolean',
            'permissions' => 'array',
            'is_active' => 'boolean',
        ];
    }

    public function hasPermission(string $permission): bool
    {
        return $this->is_super_admin || in_array($permission, $this->permissions ?? [], true);
    }

    /**
     * What this user may do, for the frontend to show or hide navigation.
     *
     * @return list<string>
     */
    public function grantedPermissions(): array
    {
        return $this->is_super_admin
            ? \App\Support\Permissions::all()
            : array_values(array_intersect(\App\Support\Permissions::all(), $this->permissions ?? []));
    }
}
