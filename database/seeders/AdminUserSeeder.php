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
            ['email' => 'admin@jtb.oyostate.gov.ng'],
            [
                'name' => 'admin',
                'email' => 'admin@jtb.oyostate.gov.ng',
                'password' => Hash::make('password1234'),
            ]
        );
    }
}
