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
        Schema::create('decision_outputs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('decision_id')->constrained()->cascadeOnDelete();
            $table->text('recommendation');
            $table->integer('confidence_score');
            $table->json('key_factors')->nullable();
            $table->json('pros')->nullable();
            $table->json('cons')->nullable();
            $table->json('risks')->nullable();
            $table->json('alternatives')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('decision_outputs');
    }
};
