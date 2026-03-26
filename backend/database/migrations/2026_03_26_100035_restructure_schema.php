<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Rename api_keys columns
        Schema::table('api_keys', function (Blueprint $table) {
            $table->renameColumn('key_encrypted', 'encrypted_key');
            $table->renameColumn('is_active', 'status');
        });

        // 2. Rename memories table to memory
        Schema::rename('memories', 'memory');

        // 3. Update decisions schema
        Schema::table('decisions', function (Blueprint $table) {
            $table->renameColumn('input_data', 'query');
            $table->integer('confidence_score')->nullable()->after('domain');
        });

        // 4. Update decision_outputs schema
        Schema::table('decision_outputs', function (Blueprint $table) {
            $table->dropColumn('confidence_score');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('decision_outputs', function (Blueprint $table) {
            $table->integer('confidence_score')->nullable();
        });

        Schema::table('decisions', function (Blueprint $table) {
            $table->renameColumn('query', 'input_data');
            $table->dropColumn('confidence_score');
        });

        Schema::rename('memory', 'memories');

        Schema::table('api_keys', function (Blueprint $table) {
            $table->renameColumn('encrypted_key', 'key_encrypted');
            $table->renameColumn('status', 'is_active');
        });
    }
};
