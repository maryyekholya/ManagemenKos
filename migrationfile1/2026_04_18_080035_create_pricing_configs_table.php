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

        Schema::create('pricing_configs', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->string('strategy_name', 100);
            $table->string('type', 20)->default('fixed');
            $table->decimal('modifier_value', 12, 2)->default(0);
            $table->tinyInteger('is_active');
            $table->date('valid_from')->nullable();
            $table->date('valid_until')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pricing_configs');
    }
};
