<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

/**
 * BaseResource: Base class untuk API resources
 * 
 * Digunakan untuk transformasi model menjadi API response format yang konsisten
 * Semua resource classes akan extend dari class ini
 */
class BaseResource extends JsonResource
{
    /**
     * Transform resource ke array untuk JSON response
     * 
     * @param \Illuminate\Http\Request $request
     * @return array
     */
    public function toArray($request)
    {
        // Override di child classes
        return parent::toArray($request);
    }

    /**
     * Add timestamp metadata ke resource
     * 
     * @return array
     */
    protected function getTimestamps(): array
    {
        return [
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }

    /**
     * Get model ID
     * 
     * @return mixed
     */
    protected function getId()
    {
        return $this->id ?? null;
    }

    /**
     * Format created at timestamp
     * 
     * @return string|null
     */
    protected function getCreatedAt(): ?string
    {
        return $this->created_at?->toIso8601String();
    }

    /**
     * Format updated at timestamp
     * 
     * @return string|null
     */
    protected function getUpdatedAt(): ?string
    {
        return $this->updated_at?->toIso8601String();
    }
}
