<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@jrb.oyostate.gov.ng'],
            [
                'name' => 'admin',
                'email' => 'admin@jrb.oyostate.gov.ng',
                'password' => Hash::make('password1234'),
                'is_super_admin' => true,
                'is_active' => true,
            ]
        );
    }
}
