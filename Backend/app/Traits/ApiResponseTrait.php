<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;

/**
 * ApiResponseTrait: Trait untuk response format yang konsisten di semua API endpoint
 * 
 * Menyediakan method-method helper untuk mengembalikan response JSON yang terstruktur
 * dengan format: { success: bool, message: string, data: mixed, errors: array }
 */
trait ApiResponseTrait
{
    /**
     * Return success response
     * 
     * @param mixed $data - Data yang akan dikembalikan
     * @param string $message - Message (default: "Operation successful")
     * @param int $statusCode - HTTP status code (default: 200)
     * @param array $meta - Metadata tambahan (pagination, filters, dll)
     */
    public function successResponse(
        mixed $data = null,
        string $message = "Operation successful",
        int $statusCode = 200,
        array $meta = []
    ): JsonResponse {
        $response = [
            'success' => true,
            'message' => $message,
        ];

        if ($data !== null) {
            $response['data'] = $data;
        }

        if (!empty($meta)) {
            $response['meta'] = $meta;
        }

        return response()->json($response, $statusCode);
    }

    /**
     * Return success response with pagination
     * 
     * @param \Illuminate\Pagination\Paginator $paginated - Paginated data
     * @param string $message - Message
     * @param array $additional - Additional data to merge
     */
    public function paginatedResponse(
        $paginated,
        string $message = "Data retrieved successfully",
        array $additional = []
    ): JsonResponse {
        $response = [
            'success' => true,
            'message' => $message,
            'data' => $paginated->items(),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
                'last_page' => $paginated->lastPage(),
                'from' => $paginated->firstItem(),
                'to' => $paginated->lastItem(),
            ],
        ];

        if (!empty($additional)) {
            $response['meta'] = array_merge($response['meta'], $additional);
        }

        return response()->json($response);
    }

    /**
     * Return error response
     * 
     * @param string $message - Error message
     * @param int $statusCode - HTTP status code (default: 400)
     * @param array $errors - Detailed errors (validation errors, etc)
     * @param mixed $data - Additional data (optional)
     */
    public function errorResponse(
        string $message = "Operation failed",
        int $statusCode = 400,
        array $errors = [],
        mixed $data = null
    ): JsonResponse {
        $response = [
            'success' => false,
            'message' => $message,
        ];

        if (!empty($errors)) {
            $response['errors'] = $errors;
        }

        if ($data !== null) {
            $response['data'] = $data;
        }

        return response()->json($response, $statusCode);
    }

    /**
     * Return validation error response
     * 
     * @param array $errors - Validation errors from form request
     * @param string $message - Error message (default: "Validation failed")
     */
    public function validationErrorResponse(
        array $errors,
        string $message = "Validation failed"
    ): JsonResponse {
        return $this->errorResponse(
            message: $message,
            statusCode: 422,
            errors: $errors
        );
    }

    /**
     * Return not found response
     * 
     * @param string $resource - Resource name yang tidak ditemukan
     */
    public function notFoundResponse(string $resource = "Resource"): JsonResponse
    {
        return $this->errorResponse(
            message: "$resource not found",
            statusCode: 404
        );
    }

    /**
     * Return unauthorized response
     * 
     * @param string $message - Custom message
     */
    public function unauthorizedResponse(string $message = "Unauthorized"): JsonResponse
    {
        return $this->errorResponse(
            message: $message,
            statusCode: 401
        );
    }

    /**
     * Return forbidden response
     * 
     * @param string $message - Custom message
     */
    public function forbiddenResponse(string $message = "Forbidden"): JsonResponse
    {
        return $this->errorResponse(
            message: $message,
            statusCode: 403
        );
    }

    /**
     * Return server error response
     * 
     * @param string $message - Error message
     */
    public function serverErrorResponse(string $message = "Internal server error"): JsonResponse
    {
        return $this->errorResponse(
            message: $message,
            statusCode: 500
        );
    }

    /**
     * Return conflict response (duplicate entry, etc)
     * 
     * @param string $message - Conflict message
     * @param array $errors - Additional error details
     */
    public function conflictResponse(
        string $message = "Conflict",
        array $errors = []
    ): JsonResponse {
        return $this->errorResponse(
            message: $message,
            statusCode: 409,
            errors: $errors
        );
    }
}
