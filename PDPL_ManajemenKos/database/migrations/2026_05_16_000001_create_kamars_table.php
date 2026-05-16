<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tabel kamars — menyimpan data unit kamar kos.
     */
    public function up(): void
    {
        Schema::create('kamars', function (Blueprint $table) {
            $table->id();
            $table->string('nomor')->unique();
            $table->enum('tipe', ['Standard', 'Deluxe', 'Suite'])->default('Standard');
            $table->bigInteger('harga_dasar');
            $table->json('fasilitas')->nullable();
            $table->enum('status', ['TERSEDIA', 'DIPESAN', 'DIHUNI'])->default('TERSEDIA');
            $table->string('foto_url')->nullable();
            $table->tinyInteger('lantai')->default(1);
            $table->text('deskripsi')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kamars');
    }
};
