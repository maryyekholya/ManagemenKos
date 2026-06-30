<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tabel bookings — menyimpan data pemesanan kamar.
     */
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kamar_id')->constrained('kamars')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('user_name');
            $table->date('tgl_masuk');
            $table->date('tgl_keluar');
            $table->tinyInteger('durasi_bulan')->default(1);
            $table->enum('status', ['DIPESAN', 'MENUNGGU PEMBAYARAN', 'MENUNGGU_PEMBAYARAN', 'DIKONFIRMASI', 'DIHUNI', 'SELESAI', 'DIBATALKAN'])->default('DIPESAN');
            $table->bigInteger('total');
            $table->enum('metode_bayar', ['TRANSFER', 'QRIS', 'CASH', 'DOMPET_DIGITAL'])->default('QRIS');
            $table->text('catatan')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
