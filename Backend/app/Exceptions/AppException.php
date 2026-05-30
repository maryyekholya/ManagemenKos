<?php

namespace App\Exceptions;

use Exception;

/**
 * AppException: Custom base exception untuk aplikasi
 * 
 * Digunakan untuk error handling yang terstruktur di semua services dan repositories
 */
class AppException extends Exception
{
    protected int $httpStatusCode;
    protected array $errors = [];

    /**
     * Constructor
     * 
     * @param string $message - Error message
     * @param int $httpStatusCode - HTTP status code (default: 400)
     * @param array $errors - Detailed error information
     * @param int $code - Exception code (default: 0)
     * @param Exception|null $previous - Previous exception
     */
    public function __construct(
        string $message = "An error occurred",
        int $httpStatusCode = 400,
        array $errors = [],
        int $code = 0,
        ?Exception $previous = null
    ) {
        parent::__construct($message, $code, $previous);
        $this->httpStatusCode = $httpStatusCode;
        $this->errors = $errors;
    }

    /**
     * Get HTTP status code
     * 
     * @return int
     */
    public function getHttpStatusCode(): int
    {
        return $this->httpStatusCode;
    }

    /**
     * Get detailed errors
     * 
     * @return array
     */
    public function getErrors(): array
    {
        return $this->errors;
    }

    /**
     * Set detailed errors
     * 
     * @param array $errors
     * @return self
     */
    public function setErrors(array $errors): self
    {
        $this->errors = $errors;
        return $this;
    }
}

/**
 * ValidationException: Exception untuk validation errors
 */
class ValidationException extends AppException
{
    public function __construct(
        string $message = "Validation failed",
        array $errors = []
    ) {
        parent::__construct($message, 422, $errors);
    }
}

/**
 * ResourceNotFoundException: Exception untuk resource yang tidak ditemukan
 */
class ResourceNotFoundException extends AppException
{
    public function __construct(
        string $resourceName = "Resource",
        ?string $identifier = null
    ) {
        $message = "$resourceName not found";
        if ($identifier) {
            $message .= " (ID: $identifier)";
        }
        parent::__construct($message, 404);
    }
}

/**
 * UnauthorizedException: Exception untuk unauthorized access
 */
class UnauthorizedException extends AppException
{
    public function __construct(
        string $message = "Unauthorized access"
    ) {
        parent::__construct($message, 401);
    }
}

/**
 * ForbiddenException: Exception untuk forbidden access
 */
class ForbiddenException extends AppException
{
    public function __construct(
        string $message = "Access forbidden"
    ) {
        parent::__construct($message, 403);
    }
}

/**
 * ConflictException: Exception untuk conflict (duplicate, constraint violation, etc)
 */
class ConflictException extends AppException
{
    public function __construct(
        string $message = "Conflict",
        array $errors = []
    ) {
        parent::__construct($message, 409, $errors);
    }
}

/**
 * ServerException: Exception untuk server/internal errors
 */
class ServerException extends AppException
{
    public function __construct(
        string $message = "Internal server error"
    ) {
        parent::__construct($message, 500);
    }
}
