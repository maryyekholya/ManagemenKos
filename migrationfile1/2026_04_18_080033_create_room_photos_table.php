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
        Schema::disableForeignKeyConstraints();

        Schema::create('room_photos', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->char('room_id', 36);
            $table->foreign('room_id')->references('id')->on('rooms');
            $table->string('photo_url', 500);
            $table->tinyInteger('is_primary');
            $table->tinyInteger('sort_order');
        });

        Schema::enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('room_photos');
    }
};
