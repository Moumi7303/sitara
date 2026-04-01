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
        Schema::table('memory', function (Blueprint $table) {
            $table->renameColumn('context', 'content');
            $table->string('type')->default('preference')->after('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('memory', function (Blueprint $table) {
            $table->dropColumn('type');
            $table->renameColumn('content', 'context');
        });
    }
};
