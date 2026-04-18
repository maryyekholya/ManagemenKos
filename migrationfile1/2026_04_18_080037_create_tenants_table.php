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

        Schema::create('tenants', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->char('user_id', 36);
            $table->foreign('user_id')->references('id')->on('users');
            $table->char('room_id', 36);
            $table->foreign('room_id')->references('id')->on('rooms');
            $table->char('booking_id', 36)->unique();
            $table->foreign('booking_id')->references('id')->on('bookings');
            $table->date('move_in_date');
            $table->date('move_out_date')->nullable();
            $table->string('status', 20)->default('active');
            $table->string('emergency_contact', 200)->nullable();
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
        Schema::dropIfExists('tenants');
    }
};
