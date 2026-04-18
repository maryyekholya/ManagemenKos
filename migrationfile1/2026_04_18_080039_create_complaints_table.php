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

        Schema::create('complaints', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->char('tenant_id', 36);
            $table->foreign('tenant_id')->references('id')->on('tenants');
            $table->char('handled_by', 36)->nullable();
            $table->foreign('handled_by')->references('id')->on('users');
            $table->string('category', 20)->default('facility');
            $table->text('description');
            $table->string('status', 20)->default('open');
            $table->string('routing_strategy', 50)->default('facility');
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('resolved_at')->nullable();
        });

        Schema::enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('complaints');
    }
};
