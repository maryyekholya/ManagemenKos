<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'phone',
        'address',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
        ];
    }

    // Relasi
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    // Helper: redirect setelah login sesuai role
    public function getDashboardRoute(): string
    {
        return match($this->role) {
            'admin'   => route('admin.dashboard'),
            'manager' => route('manager.dashboard'),
            'user'    => route('user.dashboard'),
            default   => route('landing'),
        };
    }
}
