<?php

namespace App\Services;

use App\Repositories\BaseRepository;

/**
 * BaseService: Base class untuk semua services
 * 
 * Menyediakan:
 * - Centralized business logic
 * - Integration dengan repository
 * - Error handling
 * - Transaction management
 * 
 * Services menggunakan repositories untuk database operations
 * dan menambahkan business logic di atasnya
 */
abstract class BaseService
{
    protected BaseRepository $repository;

    /**
     * Constructor - Set repository
     * 
     * @param BaseRepository $repository
     */
    public function __construct(BaseRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Get repository instance
     * 
     * @return BaseRepository
     */
    public function getRepository(): BaseRepository
    {
        return $this->repository;
    }

    /**
     * Format response data
     * 
     * @param mixed $data - Data yang diformat
     * @param array $include - Relationships yang di-include
     * @return mixed
     */
    public function formatResponseData(mixed $data, array $include = []): mixed
    {
        // Override di child classes untuk custom formatting
        return $data;
    }

    /**
     * Validate data sebelum create/update
     * 
     * @param array $data - Data yang divalidasi
     * @param string $action - Action type (create, update)
     * @return array - Validated data
     * @throws \App\Exceptions\ValidationException
     */
    public function validateData(array $data, string $action = 'create'): array
    {
        // Override di child classes untuk custom validation logic
        return $data;
    }

    /**
     * Authorize user untuk melakukan action
     * 
     * @param string $action - Action name
     * @param mixed $resource - Resource being acted upon
     * @return bool
     * @throws \App\Exceptions\ForbiddenException
     */
    public function authorize(string $action, mixed $resource = null): bool
    {
        // Override di child classes untuk authorization logic
        return true;
    }

    /**
     * Log activity/audit trail
     * 
     * @param string $action - Action yang dilakukan
     * @param mixed $model - Model yang diaffect
     * @param array $changes - Changes yang dibuat
     * @return void
     */
    protected function logActivity(string $action, mixed $model, array $changes = []): void
    {
        // TODO: Implement audit logging ke activity_logs table
        // logger()->info("Activity: $action", [
        //     'model' => class_basename($model),
        //     'id' => $model->id,
        //     'changes' => $changes,
        //     'user_id' => auth()->id(),
        // ]);
    }

    /**
     * Start database transaction
     * 
     * @return void
     */
    protected function startTransaction(): void
    {
        \DB::beginTransaction();
    }

    /**
     * Commit database transaction
     * 
     * @return void
     */
    protected function commit(): void
    {
        \DB::commit();
    }

    /**
     * Rollback database transaction
     * 
     * @return void
     */
    protected function rollback(): void
    {
        \DB::rollBack();
    }

    /**
     * Execute dalam transaction
     * 
     * @param callable $callback - Callback yang dijalankan dalam transaction
     * @return mixed
     * @throws \Exception
     */
    protected function inTransaction(callable $callback): mixed
    {
        try {
            $this->startTransaction();
            $result = $callback();
            $this->commit();
            return $result;
        } catch (\Exception $e) {
            $this->rollback();
            throw $e;
        }
    }

    /**
     * Check if resource exists
     * 
     * @param int|string $id - Resource ID
     * @return bool
     */
    public function exists(int|string $id): bool
    {
        return $this->repository->exists($id);
    }

    /**
     * Get total count
     * 
     * @return int
     */
    public function count(): int
    {
        return $this->repository->count();
    }
}
