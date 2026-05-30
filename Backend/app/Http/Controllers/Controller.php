<?php

namespace App\Http\Controllers;

use App\Traits\ApiResponseTrait;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseControllerFramework;

/**
 * BaseController: Base class untuk semua controllers di aplikasi
 * 
 * Menyediakan common functionality:
 * - API response methods via ApiResponseTrait
 * - Authorization & validation methods dari Laravel
 * - Error handling standardized
 */
class Controller extends BaseControllerFramework
{
    use AuthorizesRequests, ValidatesRequests, ApiResponseTrait;

    /**
     * Constructor - Optional untuk inisialisasi common logic
     */
    public function __construct()
    {
        // Override di child controllers jika diperlukan
    }
}

