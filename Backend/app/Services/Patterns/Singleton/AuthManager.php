<?php

namespace App\Services\Patterns\Singleton;

class AuthManager
{
    private static ?AuthManager $instance = null;
    private ?array $currentUser = null;

    private function __construct() {}

    public static function getInstance(): AuthManager
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function login(string $email, string $password): bool
    {
        // Simulasi autentikasi
        if ($email === 'admin@kos.com' && $password === 'admin123') {
            $this->currentUser = ['id' => 1, 'email' => $email, 'role' => 'admin'];
            return true;
        }
        return false;
    }

    public function getCurrentUser(): ?array
    {
        return $this->currentUser;
    }

    public function hasRole(string $role): bool
    {
        return $this->currentUser !== null && $this->currentUser['role'] === $role;
    }
}
