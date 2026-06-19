<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Booking;
use App\Models\Kamar;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;

echo "--- MENGHAPUS DATA LAMA ---\n";
User::where('email', 'like', '%test%')->delete();
Booking::query()->delete();

// Bikin User
$user = User::create([
    'name' => 'User Test',
    'email' => 'user_test@example.com',
    'password' => Hash::make('password'),
    'role' => 'user'
]);
$userToken = $user->createToken('API Token')->plainTextToken;

// Bikin Manager
$manager = User::create([
    'name' => 'Manager Test',
    'email' => 'manager_test@example.com',
    'password' => Hash::make('password'),
    'role' => 'manager'
]);
$managerToken = $manager->createToken('API Token')->plainTextToken;

$baseUrl = 'http://127.0.0.1:8000/api/v1';
$kamar = Kamar::first();

echo "1. Create Booking as User\n";
$res = Http::withToken($userToken)->acceptJson()->post("$baseUrl/bookings", [
    'kamar_id' => $kamar->id,
    'durasi_bulan' => 2
]);
echo "Status: " . $res->status() . "\n";
echo $res->body() . "\n\n";
$bookingId = $res->json('data.id');

echo "2. Proceed Booking as User\n";
$res = Http::withToken($userToken)->acceptJson()->put("$baseUrl/bookings/$bookingId/proceed");
echo "Status: " . $res->status() . "\n";
echo $res->body() . "\n\n";

echo "3. Pay Booking as User (DOMPET_DIGITAL)\n";
$res = Http::withToken($userToken)->acceptJson()->put("$baseUrl/bookings/$bookingId/pay", [
    'metode_pembayaran' => 'DOMPET_DIGITAL'
]);
echo "Status: " . $res->status() . "\n";
echo $res->body() . "\n\n";

echo "4. Approve Booking as Manager\n";
$res = Http::withToken($managerToken)->acceptJson()->put("$baseUrl/admin/bookings/$bookingId/approve");
echo "Status: " . $res->status() . "\n";
echo $res->body() . "\n\n";

echo "5. Check Out Booking as User\n";
$res = Http::withToken($userToken)->acceptJson()->put("$baseUrl/bookings/$bookingId/checkout");
echo "Status: " . $res->status() . "\n";
echo $res->body() . "\n\n";

echo "6. User Submits a Complaint\n";
$res = Http::withToken($userToken)->acceptJson()->post("$baseUrl/complaints", [
    'kategori' => 'FASILITAS',
    'deskripsi' => 'AC di kamar bocor dan tidak dingin.'
]);
echo "Status: " . $res->status() . "\n";
echo $res->body() . "\n\n";
$complaintId = $res->json('data.id');

echo "7. Manager Responds to the Complaint\n";
$res = Http::withToken($managerToken)->acceptJson()->put("$baseUrl/admin/complaints/$complaintId/respond", [
    'respon_manager' => 'Teknisi akan segera datang besok pagi jam 9.'
]);
echo "Status: " . $res->status() . "\n";
echo $res->body() . "\n\n";

echo "8. Manager Adds a New Room\n";
$res = Http::withToken($managerToken)->acceptJson()->post("$baseUrl/admin/rooms", [
    'nomor' => '109',
    'tipe' => 'VIP',
    'harga_dasar' => 2500000,
    'status' => 'TERSEDIA'
]);
echo "Status: " . $res->status() . "\n";
echo $res->body() . "\n\n";

