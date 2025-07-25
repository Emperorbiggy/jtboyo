<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('auth_apps', function (Blueprint $table) {
            $table->id();
            $table->string('app_name');
            $table->string('token')->unique(); // API token for Authorization header
            $table->json('whitelisted_ips'); // IPs allowed to use this token
            $table->unsignedBigInteger('request_count')->default(0); // count of successful API requests
            $table->boolean('status')->default(true); // active/inactive
            $table->timestamp('last_accessed_at')->nullable(); // when the token was last used
            $table->string('description')->nullable(); // optional notes
            $table->timestamps(); // created_at & updated_at
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('auth_apps');
    }
};
