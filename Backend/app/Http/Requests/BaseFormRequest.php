<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

/**
 * BaseFormRequest: Base class untuk semua form requests
 * 
 * Menyediakan:
 * - Centralized error handling & response formatting
 * - Common validation methods
 * - Authorization checking
 */
abstract class BaseFormRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request
     * 
     * @return bool
     */
    public function authorize(): bool
    {
        // Override di child classes untuk custom authorization logic
        return true;
    }

    /**
     * Get the validation rules
     * 
     * @return array
     */
    abstract public function rules(): array;

    /**
     * Get custom messages untuk validation errors
     * 
     * @return array
     */
    public function messages(): array
    {
        return [];
    }

    /**
     * Handle a failed validation attempt
     * 
     * Return consistent error response format
     * 
     * @param Validator $validator
     * @throws HttpResponseException
     */
    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(
            response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422)
        );
    }

    /**
     * Handle a failed authorization attempt
     * 
     * @throws HttpResponseException
     */
    protected function failedAuthorization(): void
    {
        throw new HttpResponseException(
            response()->json([
                'success' => false,
                'message' => 'Unauthorized - You are not allowed to perform this action',
            ], 403)
        );
    }

    /**
     * Get validated data
     * 
     * @param array|null $keys - Specific keys to retrieve
     * @return array
     */
    public function validatedData(?array $keys = null): array
    {
        if ($keys) {
            return $this->validated($keys);
        }
        return $this->validated();
    }

    /**
     * Get validated data dengan transformasi default
     * 
     * @return array
     */
    public function getValidatedData(): array
    {
        return $this->validated();
    }

    /**
     * Prepare data untuk database storage
     * Override di child classes jika diperlukan transformasi khusus
     * 
     * @return array
     */
    public function prepareForStorage(): array
    {
        return $this->validated();
    }
}
