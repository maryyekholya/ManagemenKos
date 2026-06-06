<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class ApiAuthController extends Controller
{
    /**
     * Handle Login (API)
     */
    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal. Kolom email wajib diisi dengan format yang benar.',
                'errors' => $validator->errors()
            ], 422);
        }

        if (Auth::attempt($request->only('email', 'password'))) {
            $user = Auth::user();
            // Assuming you are using Sanctum for API tokens, but for now we'll just mock the token
            // and return the actual user data from DB.
            return response()->json([
                'success' => true,
                'message' => 'Login berhasil.',
                'token' => 'mock-jwt-token-12345', // In real app: $user->createToken('API Token')->plainTextToken
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role
                ]
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Kredensial tidak valid.',
        ], 401);
    }

    /**
     * Handle Registration (API)
     */
    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:8',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal.',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Registrasi berhasil. Silakan cek email Anda.',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email
            ]
        ], 201);
    }

    /**
     * Handle Google OAuth Redirect/Callback (API Mock)
     */
    public function googleLogin(Request $request): JsonResponse
    {
        // Dalam implementasi nyata ini akan memanggil Socialite::driver('google')->redirect()
        // Atau menerima access_token dari frontend untuk di validasi via Socialite
        
        return response()->json([
            'success' => true,
            'message' => 'Simulasi Google Login berhasil. Akun Anda berhasil terhubung.',
            'token' => 'mock-google-token-98765',
            'user' => [
                'name' => 'Google User',
                'email' => 'google.user@example.com',
                'provider' => 'google'
            ]
        ]);
    }
}
