<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * RoleMiddleware
 *
 * Middleware untuk Role-Based Access Control (RBAC).
 * Memvalidasi role user terhadap route yang diakses,
 * dan meredirect ke dashboard sesuai role jika akses tidak diizinkan.
 *
 * Penggunaan di routes: ->middleware('role:admin')
 *                       ->middleware('role:admin,manager')
 */
class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles  Role yang diizinkan (bisa multiple: 'admin', 'manager')
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        // Pastikan user sudah login
        if (!auth()->check()) {
            return redirect()->route('login');
        }

        $user = auth()->user();

        // Cek apakah role user masuk dalam daftar role yang diizinkan
        if (!in_array($user->role, $roles)) {
            // Redirect ke dashboard sesuai role user yang sebenarnya
            return redirect($user->getDashboardRoute())
                ->with('error', 'Anda tidak memiliki akses ke halaman tersebut.');
        }

        return $next($request);
    }
}
