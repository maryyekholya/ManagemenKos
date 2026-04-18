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
        Schema::create('rooms', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->string('room_number', 20)->unique();
            $table->string('type', 20)->default('standard');
            $table->decimal('base_price', 12, 2);
            $table->string('status', 20)->default('available');
            $table->tinyInteger('floor')->default(1);
            $table->decimal('area_sqm', 5, 1)->nullable();
            $table->text('description')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};
