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

        Schema::create('bookings', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->char('room_id', 36);
            $table->foreign('room_id')->references('id')->on('rooms');
            $table->char('guest_id', 36);
            $table->foreign('guest_id')->references('id')->on('users');
            $table->char('pricing_config_id', 36)->nullable();
            $table->foreign('pricing_config_id')->references('id')->on('pricing_configs');
            $table->date('start_date');
            $table->date('end_date');
            $table->string('status', 20)->default('pending');
            $table->decimal('total_price', 12, 2);
            $table->string('pricing_strategy', 100)->default('Harga Normal');
            $table->text('notes')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent();
        });

        Schema::enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
