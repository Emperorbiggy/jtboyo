<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('is_super_admin')->default(false)->after('password');
            $table->json('permissions')->nullable()->after('is_super_admin');
            $table->boolean('is_active')->default(true)->after('permissions');
        });

        // Keep someone able to manage admins: the seeded admin if present,
        // otherwise the oldest account. Everyone else starts with no access.
        $owner = DB::table('users')->where('email', 'admin@jrb.oyostate.gov.ng')->value('id')
            ?? DB::table('users')->orderBy('id')->value('id');

        if ($owner) {
            DB::table('users')->where('id', $owner)->update(['is_super_admin' => true]);
        }
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['is_super_admin', 'permissions', 'is_active']);
        });
    }
};
