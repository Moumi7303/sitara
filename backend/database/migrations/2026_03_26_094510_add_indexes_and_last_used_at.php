<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add last_used_at to api_keys
        Schema::table('api_keys', function (Blueprint $table) {
            $table->timestamp('last_used_at')->nullable()->after('is_active');
            $table->index(['user_id', 'is_active']);
        });

        // Index decisions for fast user lookups
        Schema::table('decisions', function (Blueprint $table) {
            $table->index(['user_id', 'status']);
            $table->index(['user_id', 'created_at']);
        });

        // Index audit_logs for fast user history queries
        Schema::table('audit_logs', function (Blueprint $table) {
            $table->index(['user_id', 'action']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::table('api_keys', function (Blueprint $table) {
            $table->dropColumn('last_used_at');
            $table->dropIndex(['user_id', 'is_active']);
        });

        Schema::table('decisions', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'status']);
            $table->dropIndex(['user_id', 'created_at']);
        });

        Schema::table('audit_logs', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'action']);
            $table->dropIndex(['created_at']);
        });
    }
};
