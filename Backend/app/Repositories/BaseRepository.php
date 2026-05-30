<?php

namespace App\Repositories;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\Paginator;

/**
 * BaseRepository: Abstract base class untuk semua repository
 * 
 * Menyediakan CRUD operations yang umum untuk semua model
 * Mengikuti Repository Pattern untuk abstraksi database queries
 */
abstract class BaseRepository
{
    protected Model $model;

    /**
     * Constructor - Set model yang akan digunakan
     * 
     * @param Model $model
     */
    public function __construct(Model $model)
    {
        $this->model = $model;
    }

    /**
     * GET ALL - Dapatkan semua records
     * 
     * @param array $columns - Columns yang diambil
     * @param array $relations - Relations yang di-load (eager loading)
     * @return Collection
     */
    public function all(array $columns = ['*'], array $relations = []): Collection
    {
        $query = $this->model->query();
        
        if (!empty($relations)) {
            $query->with($relations);
        }

        return $query->get($columns);
    }

    /**
     * GET PAGINATED - Dapatkan records dengan pagination
     * 
     * @param int $perPage - Jumlah records per halaman
     * @param array $columns - Columns yang diambil
     * @param string $pageName - Nama query parameter untuk page
     * @param int|null $page - Page number
     * @return \Illuminate\Pagination\LengthAwarePaginator
     */
    public function paginate(
        int $perPage = 15,
        array $columns = ['*'],
        string $pageName = 'page',
        ?int $page = null
    ) {
        return $this->model->paginate($perPage, $columns, $pageName, $page);
    }

    /**
     * FIND BY ID - Dapatkan record berdasarkan ID
     * 
     * @param int|string $id - ID dari record
     * @param array $columns - Columns yang diambil
     * @param array $relations - Relations yang di-load
     * @return Model|null
     */
    public function findById(
        int|string $id,
        array $columns = ['*'],
        array $relations = []
    ): ?Model {
        $query = $this->model->query();
        
        if (!empty($relations)) {
            $query->with($relations);
        }

        return $query->find($id, $columns);
    }

    /**
     * FIND BY - Dapatkan record berdasarkan column dan value
     * 
     * @param string $column - Column name
     * @param mixed $value - Column value
     * @param array $columns - Columns yang diambil
     * @param array $relations - Relations yang di-load
     * @return Model|null
     */
    public function findBy(
        string $column,
        mixed $value,
        array $columns = ['*'],
        array $relations = []
    ): ?Model {
        $query = $this->model->query();
        
        if (!empty($relations)) {
            $query->with($relations);
        }

        return $query->where($column, $value)->first($columns);
    }

    /**
     * FIND MANY BY - Dapatkan multiple records berdasarkan column dan value
     * 
     * @param string $column - Column name
     * @param mixed $value - Column value
     * @param array $columns - Columns yang diambil
     * @return Collection
     */
    public function findManyBy(
        string $column,
        mixed $value,
        array $columns = ['*']
    ): Collection {
        return $this->model->query()
            ->where($column, $value)
            ->get($columns);
    }

    /**
     * CREATE - Buat record baru
     * 
     * @param array $data - Data untuk dimasukkan
     * @return Model
     */
    public function create(array $data): Model
    {
        return $this->model->create($data);
    }

    /**
     * UPDATE - Update record berdasarkan ID
     * 
     * @param int|string $id - ID dari record
     * @param array $data - Data yang diupdate
     * @return Model|null
     */
    public function update(int|string $id, array $data): ?Model
    {
        $model = $this->findById($id);

        if ($model) {
            $model->update($data);
        }

        return $model;
    }

    /**
     * UPDATE WHERE - Update multiple records berdasarkan condition
     * 
     * @param string $column - Column name
     * @param mixed $value - Column value
     * @param array $data - Data yang diupdate
     * @return int - Jumlah records yang terupdate
     */
    public function updateWhere(
        string $column,
        mixed $value,
        array $data
    ): int {
        return $this->model->query()
            ->where($column, $value)
            ->update($data);
    }

    /**
     * DELETE - Hapus record berdasarkan ID
     * 
     * @param int|string $id - ID dari record
     * @return bool
     */
    public function delete(int|string $id): bool
    {
        $model = $this->findById($id);
        return $model ? $model->delete() : false;
    }

    /**
     * DELETE WHERE - Hapus multiple records berdasarkan condition
     * 
     * @param string $column - Column name
     * @param mixed $value - Column value
     * @return int - Jumlah records yang terhapus
     */
    public function deleteWhere(string $column, mixed $value): int
    {
        return $this->model->query()
            ->where($column, $value)
            ->delete();
    }

    /**
     * EXISTS - Cek apakah record exists
     * 
     * @param int|string $id - ID dari record
     * @return bool
     */
    public function exists(int|string $id): bool
    {
        return $this->model->query()
            ->where('id', $id)
            ->exists();
    }

    /**
     * COUNT - Hitung total records
     * 
     * @param string|null $column - Column untuk dihitung (default: *)
     * @return int
     */
    public function count(?string $column = null): int
    {
        return $this->model->query()->count($column ?? '*');
    }

    /**
     * COUNT WHERE - Hitung records dengan condition
     * 
     * @param string $column - Column name
     * @param mixed $value - Column value
     * @return int
     */
    public function countWhere(string $column, mixed $value): int
    {
        return $this->model->query()
            ->where($column, $value)
            ->count();
    }

    /**
     * WHERE - Advanced filtering dengan array conditions
     * 
     * @param array $conditions - Array of [column => value]
     * @param array $columns - Columns yang diambil
     * @return Collection
     */
    public function where(array $conditions, array $columns = ['*']): Collection
    {
        $query = $this->model->query();

        foreach ($conditions as $column => $value) {
            if (is_array($value)) {
                $query->whereIn($column, $value);
            } else {
                $query->where($column, $value);
            }
        }

        return $query->get($columns);
    }

    /**
     * ORDER BY - Dapatkan records dengan ordering
     * 
     * @param string $column - Column untuk diurutkan
     * @param string $direction - Order direction ('asc' or 'desc')
     * @param array $columns - Columns yang diambil
     * @return Collection
     */
    public function orderBy(
        string $column,
        string $direction = 'asc',
        array $columns = ['*']
    ): Collection {
        return $this->model->query()
            ->orderBy($column, $direction)
            ->get($columns);
    }

    /**
     * SEARCH - Search records berdasarkan keyword di columns tertentu
     * 
     * @param string $keyword - Keyword untuk dicari
     * @param array $searchColumns - Columns yang di-search
     * @param array $columns - Columns yang diambil
     * @return Collection
     */
    public function search(
        string $keyword,
        array $searchColumns = ['name', 'title'],
        array $columns = ['*']
    ): Collection {
        $query = $this->model->query();

        foreach ($searchColumns as $column) {
            $query->orWhere($column, 'LIKE', "%{$keyword}%");
        }

        return $query->get($columns);
    }

    /**
     * FIRST - Dapatkan record pertama
     * 
     * @param array $columns - Columns yang diambil
     * @return Model|null
     */
    public function first(array $columns = ['*']): ?Model
    {
        return $this->model->query()->first($columns);
    }

    /**
     * LAST - Dapatkan record terakhir
     * 
     * @param array $columns - Columns yang diambil
     * @return Model|null
     */
    public function last(array $columns = ['*']): ?Model
    {
        return $this->model->query()
            ->orderByDesc('id')
            ->first($columns);
    }

    /**
     * PLUCK - Dapatkan single column values sebagai collection
     * 
     * @param string $column - Column yang diambil
     * @param string|null $key - Key untuk associative array
     * @return Collection
     */
    public function pluck(string $column, ?string $key = null): Collection
    {
        if ($key) {
            return $this->model->query()->pluck($column, $key);
        }
        return $this->model->query()->pluck($column);
    }

    /**
     * Get Model Instance
     * 
     * @return Model
     */
    public function getModel(): Model
    {
        return $this->model;
    }

    /**
     * QUERY BUILDER - Dapatkan fresh query builder untuk custom queries
     * 
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function query()
    {
        return $this->model->query();
    }
}
