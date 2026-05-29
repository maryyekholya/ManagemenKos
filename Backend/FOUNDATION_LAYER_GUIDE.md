# Laravel Backend Foundation Layer - Implementation Guide

**Created:** May 29, 2026  
**Status:** Foundation Phase Complete ✅

---

## 📦 Foundation Layer Components

The foundation layer provides reusable base classes and traits for consistent CRUD operations and API responses.

### Created Files:

1. **`app/Traits/ApiResponseTrait.php`** - API Response Formatting
2. **`app/Repositories/BaseRepository.php`** - Database CRUD Operations
3. **`app/Http/Controllers/Controller.php`** (Updated) - Base Controller
4. **`app/Exceptions/AppException.php`** - Exception Handling
5. **`app/Http/Resources/BaseResource.php`** - API Response Transformation
6. **`app/Http/Requests/BaseFormRequest.php`** - Form Validation

---

## 🏗️ Architecture Overview

```
Request
   ↓
Routes
   ↓
FormRequest (Validation + Authorization)
   ↓
Controller (Request Handling)
   ↓
Service (Business Logic)
   ↓
Repository (Database Queries)
   ↓
Model (ORM)
   ↓
Database
```

---

## 📚 Component Details

### 1. ApiResponseTrait

**Location:** `app/Traits/ApiResponseTrait.php`

**Purpose:** Provides standardized JSON response methods for all controllers.

**Available Methods:**
```php
// Success responses
$this->successResponse($data, $message, $statusCode, $meta);
$this->paginatedResponse($paginated, $message, $additional);

// Error responses
$this->errorResponse($message, $statusCode, $errors, $data);
$this->validationErrorResponse($errors, $message);
$this->notFoundResponse($resource);
$this->unauthorizedResponse($message);
$this->forbiddenResponse($message);
$this->conflictResponse($message, $errors);
$this->serverErrorResponse($message);
```

**Response Format:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "meta": { ... }
}
```

**Usage in Controller:**
```php
use App\Http\Controllers\Controller;

class RoomController extends Controller
{
    public function index()
    {
        $rooms = Room::all();
        return $this->successResponse(
            $rooms,
            "Rooms retrieved successfully"
        );
    }

    public function show($id)
    {
        $room = Room::find($id);
        if (!$room) {
            return $this->notFoundResponse("Room");
        }
        return $this->successResponse($room);
    }
}
```

---

### 2. BaseRepository

**Location:** `app/Repositories/BaseRepository.php`

**Purpose:** Provides common CRUD operations for all repositories.

**Key Methods:**
```php
// Retrieve operations
$repo->all($columns, $relations);
$repo->paginate($perPage, $columns, $pageName, $page);
$repo->findById($id, $columns, $relations);
$repo->findBy($column, $value);
$repo->findManyBy($column, $value);
$repo->where($conditions);
$repo->orderBy($column, $direction);
$repo->search($keyword, $searchColumns);
$repo->first($columns);
$repo->last($columns);
$repo->pluck($column, $key);

// Manipulation operations
$repo->create($data);
$repo->update($id, $data);
$repo->updateWhere($column, $value, $data);
$repo->delete($id);
$repo->deleteWhere($column, $value);

// Check operations
$repo->exists($id);
$repo->count($column);
$repo->countWhere($column, $value);

// Query builder
$repo->query(); // Return fresh query builder for custom queries
```

**Creating a Repository:**
```php
// app/Repositories/RoomRepository.php
namespace App\Repositories;

use App\Models\Room;

class RoomRepository extends BaseRepository
{
    public function __construct(Room $model)
    {
        parent::__construct($model);
    }

    // Add custom query methods here
    public function getAvailableRooms()
    {
        return $this->where(['status' => 'available']);
    }

    public function filterByPrice($minPrice, $maxPrice)
    {
        return $this->query()
            ->whereBetween('price', [$minPrice, $maxPrice])
            ->get();
    }
}
```

---

### 3. BaseController

**Location:** `app/Http/Controllers/Controller.php`

**Purpose:** Base class for all controllers with response methods and authorization.

**Inherited Traits:**
- `ApiResponseTrait` - Response methods
- `AuthorizesRequests` - Policy authorization
- `ValidatesRequests` - Manual validation

**Usage:**
```php
namespace App\Http\Controllers;

use App\Http\Requests\StoreRoomRequest;
use App\Services\RoomService;

class RoomController extends Controller
{
    public function __construct(
        private RoomService $roomService
    ) {}

    public function index()
    {
        $rooms = $this->roomService->getAllRooms();
        return $this->successResponse($rooms);
    }

    public function store(StoreRoomRequest $request)
    {
        $room = $this->roomService->createRoom($request->validated());
        return $this->successResponse($room, "Room created", 201);
    }

    public function show($id)
    {
        $room = $this->roomService->getRoomById($id);
        if (!$room) {
            return $this->notFoundResponse("Room");
        }
        return $this->successResponse($room);
    }

    public function update(UpdateRoomRequest $request, $id)
    {
        $room = $this->roomService->updateRoom($id, $request->validated());
        return $this->successResponse($room, "Room updated");
    }

    public function destroy($id)
    {
        $deleted = $this->roomService->deleteRoom($id);
        if (!$deleted) {
            return $this->notFoundResponse("Room");
        }
        return $this->successResponse(null, "Room deleted");
    }
}
```

---

### 4. Exception Handling

**Location:** `app/Exceptions/AppException.php`

**Custom Exceptions Available:**
- `AppException` - Base exception
- `ValidationException` - Validation errors (422)
- `ResourceNotFoundException` - Resource not found (404)
- `UnauthorizedException` - Unauthorized (401)
- `ForbiddenException` - Forbidden (403)
- `ConflictException` - Conflict (409)
- `ServerException` - Server error (500)

**Usage in Service:**
```php
use App\Exceptions\{
    ValidationException,
    ResourceNotFoundException,
    ConflictException
};

class RoomService extends BaseService
{
    public function createRoom(array $data)
    {
        // Validate
        if (empty($data['name'])) {
            throw new ValidationException('Validation failed', [
                'name' => ['The name field is required']
            ]);
        }

        // Check for duplicates
        if ($this->repository->findBy('name', $data['name'])) {
            throw new ConflictException('Room with this name already exists');
        }

        return $this->repository->create($data);
    }

    public function getRoomById($id)
    {
        $room = $this->repository->findById($id);
        if (!$room) {
            throw new ResourceNotFoundException('Room', $id);
        }
        return $room;
    }
}
```

**Exception Handler Integration:**
Add to `app/Exceptions/Handler.php`:
```php
public function register(): void
{
    $this->renderable(function (AppException $e, $request) {
        return response()->json([
            'success' => false,
            'message' => $e->getMessage(),
            'errors' => $e->getErrors(),
        ], $e->getHttpStatusCode());
    });
}
```

---

### 5. BaseResource

**Location:** `app/Http/Resources/BaseResource.php`

**Purpose:** Transform models into consistent API response format.

**Creating a Resource:**
```php
// app/Http/Resources/RoomResource.php
namespace App\Http\Resources;

class RoomResource extends BaseResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->getId(),
            'name' => $this->name,
            'description' => $this->description,
            'price' => $this->price,
            'status' => $this->status,
            'manager_id' => $this->manager_id,
            'facilities' => FacilityResource::collection($this->facilities),
            'photos' => PhotoResource::collection($this->photos),
            'timestamps' => $this->getTimestamps(),
        ];
    }
}
```

**Using Resource in Controller:**
```php
public function index()
{
    $rooms = $this->roomService->getAllRooms();
    return $this->successResponse(
        RoomResource::collection($rooms)
    );
}

public function show($id)
{
    $room = $this->roomService->getRoomById($id);
    return $this->successResponse(
        new RoomResource($room)
    );
}
```

---

### 6. BaseFormRequest

**Location:** `app/Http/Requests/BaseFormRequest.php`

**Purpose:** Handle form validation and authorization.

**Creating a Form Request:**
```php
// app/Http/Requests/StoreRoomRequest.php
namespace App\Http\Requests;

class StoreRoomRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        // Only managers can create rooms
        return auth()->check() && auth()->user()->role === 'manager';
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'capacity' => 'required|integer|min:1',
            'status' => 'required|in:available,occupied,maintenance',
            'facilities' => 'array',
            'facilities.*' => 'integer|exists:facilities,id',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama kamar harus diisi',
            'price.required' => 'Harga kamar harus diisi',
        ];
    }

    public function prepareForStorage(): array
    {
        $data = $this->validated();
        $data['manager_id'] = auth()->id();
        return $data;
    }
}
```

**Using in Controller:**
```php
public function store(StoreRoomRequest $request)
{
    // Validation & authorization already done by FormRequest
    $data = $request->prepareForStorage();
    $room = $this->roomService->createRoom($data);
    
    return $this->successResponse($room, 'Room created', 201);
}
```

---

### 7. BaseService

**Location:** `app/Services/BaseService.php`

**Purpose:** Contain business logic and coordinate between controller and repository.

**Creating a Service:**
```php
// app/Services/RoomService.php
namespace App\Services;

use App\Repositories\RoomRepository;
use App\Exceptions\ResourceNotFoundException;

class RoomService extends BaseService
{
    public function __construct(RoomRepository $repository)
    {
        parent::__construct($repository);
    }

    public function getAllRooms($filters = [])
    {
        $query = $this->repository->query();

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['price_max'])) {
            $query->where('price', '<=', $filters['price_max']);
        }

        return $query->get();
    }

    public function getRoomById($id)
    {
        $room = $this->repository->findById($id, ['*'], ['facilities', 'photos']);
        if (!$room) {
            throw new ResourceNotFoundException('Room', $id);
        }
        return $room;
    }

    public function createRoom(array $data)
    {
        return $this->inTransaction(function () use ($data) {
            $room = $this->repository->create($data);
            
            if (isset($data['facilities'])) {
                $room->facilities()->sync($data['facilities']);
            }
            
            $this->logActivity('CREATE', $room, $data);
            return $room;
        });
    }

    public function updateRoom($id, array $data)
    {
        $room = $this->getRoomById($id);
        
        return $this->inTransaction(function () use ($room, $data) {
            $room = $this->repository->update($id, $data);
            
            if (isset($data['facilities'])) {
                $room->facilities()->sync($data['facilities']);
            }
            
            $this->logActivity('UPDATE', $room, $data);
            return $room;
        });
    }

    public function deleteRoom($id)
    {
        $room = $this->getRoomById($id);
        return $this->repository->delete($id);
    }
}
```

---

## 🚀 Implementation Workflow

### Step 1: Create Model
```bash
php artisan make:model Room -m
```

### Step 2: Create Repository
```php
class RoomRepository extends BaseRepository
{
    public function __construct(Room $model)
    {
        parent::__construct($model);
    }
}
```

### Step 3: Create Service
```php
class RoomService extends BaseService
{
    public function __construct(RoomRepository $repository)
    {
        parent::__construct($repository);
    }
}
```

### Step 4: Create Form Requests
```php
class StoreRoomRequest extends BaseFormRequest { ... }
class UpdateRoomRequest extends BaseFormRequest { ... }
```

### Step 5: Create Resource
```php
class RoomResource extends BaseResource { ... }
```

### Step 6: Create Controller
```php
class RoomController extends Controller
{
    public function __construct(RoomService $service) { ... }
}
```

### Step 7: Define Routes
```php
Route::apiResource('rooms', RoomController::class);
```

---

## ✅ Checklist untuk CRUD Implementation

- [ ] Model dengan migrations
- [ ] Repository extending BaseRepository
- [ ] Service extending BaseService
- [ ] Form requests extending BaseFormRequest
- [ ] Resource extending BaseResource
- [ ] Controller extending Controller (base)
- [ ] Routes defined in routes/api.php
- [ ] Tests written
- [ ] Documentation updated

---

## 📊 Standard CRUD Response Examples

### GET /api/rooms (List)
```json
{
  "success": true,
  "message": "Rooms retrieved successfully",
  "data": [...],
  "meta": {
    "current_page": 1,
    "per_page": 15,
    "total": 100,
    "last_page": 7
  }
}
```

### POST /api/rooms (Create)
```json
{
  "success": true,
  "message": "Room created successfully",
  "data": {...}
}
```

### GET /api/rooms/{id} (Show)
```json
{
  "success": true,
  "message": "Room retrieved successfully",
  "data": {...}
}
```

### PUT /api/rooms/{id} (Update)
```json
{
  "success": true,
  "message": "Room updated successfully",
  "data": {...}
}
```

### DELETE /api/rooms/{id} (Delete)
```json
{
  "success": true,
  "message": "Room deleted successfully"
}
```

### Validation Error
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "name": ["The name field is required"],
    "price": ["The price must be a number"]
  }
}
```

---

## 🔗 Integration with Existing Code

The foundation layer **does NOT break** existing code:
- Old `KamarRepository` singleton pattern still works
- `RoomController` can continue using existing patterns
- New modules will use the foundation layer

**Migration Strategy:**
1. Keep existing code as-is during development
2. New modules use foundation layer
3. Gradually refactor old code to use foundation
4. Eventually consolidate once proven stable

---

## 📝 Next Phases

- **Phase 1:** User Module (Auth, Register, Profile)
- **Phase 2:** Room Module (Full CRUD)
- **Phase 3:** Booking Module
- **Phase 4:** Payment Module
- **Phase 5:** Notifications & Complaints

---

## 🎯 Best Practices

1. **Always use FormRequest** for validation
2. **Always use Service** for business logic
3. **Always use Repository** for database queries
4. **Always use Resource** for API responses
5. **Always use exception** classes for error handling
6. **Always use trait** methods for responses
7. **Always write tests** for services

---

**Status:** Foundation layer complete and ready for Phase 1 implementation.
