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

        Schema::create('payments', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->char('booking_id', 36);
            $table->foreign('booking_id')->references('id')->on('bookings');
            $table->char('tenant_id', 36)->nullable();
            $table->foreign('tenant_id')->references('id')->on('tenants');
            $table->decimal('amount', 12, 2);
            $table->string('method', 30)->default('transfer_bank');
            $table->string('status', 20)->default('pending');
            $table->date('due_date');
            $table->date('paid_date')->nullable();
            $table->string('receipt_url', 500)->nullable();
            $table->string('payment_strategy', 50)->default('transfer_bank');
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
        Schema::dropIfExists('payments');
    }
};
