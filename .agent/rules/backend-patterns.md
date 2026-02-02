---
trigger: always_on
glob: backend/app/**/*.php
description: Design patterns chuẩn cho Laravel Backend - Controller-Service pattern
---

# Rules: Backend Design Patterns (Laravel)

## 1. Controller-Service Pattern

### Cấu trúc thư mục
```
app/
├── Http/
│   └── Controllers/
│       └── Api/           # API Controllers
│           └── UserController.php
├── Services/              # Business Logic
│   └── UserService.php
├── Repositories/          # Data Access (optional)
│   └── UserRepository.php
└── Models/                # Eloquent Models
    └── User.php
```

### Controller Rules
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\UserService;
use App\Http\Requests\StoreUserRequest;

class UserController extends Controller
{
    // ✅ Inject Service qua constructor
    public function __construct(
        private UserService $userService
    ) {}

    // ✅ Controller chỉ handle HTTP layer
    public function store(StoreUserRequest $request)
    {
        // Validation đã được handle bởi FormRequest
        $validated = $request->validated();
        
        // Business logic delegate cho Service
        $user = $this->userService->createUser($validated);
        
        // Return response
        return response()->json([
            'success' => true,
            'data' => $user,
            'message' => 'User created successfully'
        ], 201);
    }

    // ❌ KHÔNG LÀM: Business logic trong controller
    // public function store(Request $request)
    // {
    //     // Validation here - SAI
    //     // Model queries here - SAI
    //     // Email sending here - SAI
    // }
}
```

### Service Rules
```php
<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class UserService
{
    // ✅ Service chứa business logic
    public function createUser(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
            ]);
            
            // Related operations
            $user->profile()->create([
                'bio' => $data['bio'] ?? null,
            ]);
            
            // Events, notifications, etc.
            event(new UserCreated($user));
            
            return $user;
        });
    }

    public function updateUser(User $user, array $data): User
    {
        $user->update($data);
        return $user->fresh();
    }

    public function deleteUser(User $user): bool
    {
        return $user->delete();
    }
}
```

## 2. Request Validation Layer

### FormRequest Class
```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Or check authorization
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users'],
            'password' => ['required', 'min:8', 'confirmed'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Tên là bắt buộc',
            'email.unique' => 'Email đã được sử dụng',
        ];
    }
}
```

## 3. API Response Format

### Standard Response Structure
```php
<?php

// Success Response
return response()->json([
    'success' => true,
    'data' => $data,
    'message' => 'Operation successful'
], 200);

// Paginated Response
return response()->json([
    'success' => true,
    'data' => $collection->items(),
    'meta' => [
        'current_page' => $collection->currentPage(),
        'per_page' => $collection->perPage(),
        'total' => $collection->total(),
        'last_page' => $collection->lastPage(),
    ],
], 200);

// Error Response
return response()->json([
    'success' => false,
    'error' => [
        'code' => 'VALIDATION_ERROR',
        'message' => 'Validation failed',
        'details' => $errors,
    ],
], 422);
```

### Response Trait
```php
<?php

namespace App\Traits;

trait ApiResponse
{
    protected function success($data, string $message = 'Success', int $code = 200)
    {
        return response()->json([
            'success' => true,
            'data' => $data,
            'message' => $message,
        ], $code);
    }

    protected function error(string $message, int $code = 400, $errors = null)
    {
        return response()->json([
            'success' => false,
            'error' => [
                'message' => $message,
                'details' => $errors,
            ],
        ], $code);
    }
}
```

## 4. Error Handling

### Exception Handler
```php
<?php
// app/Exceptions/Handler.php

public function render($request, Throwable $exception)
{
    if ($request->expectsJson()) {
        if ($exception instanceof ValidationException) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'VALIDATION_ERROR',
                    'message' => 'Validation failed',
                    'details' => $exception->errors(),
                ],
            ], 422);
        }

        if ($exception instanceof ModelNotFoundException) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'NOT_FOUND',
                    'message' => 'Resource not found',
                ],
            ], 404);
        }
    }

    return parent::render($request, $exception);
}
```

## 5. Repository Pattern (Optional)

```php
<?php

namespace App\Repositories;

use App\Models\User;

interface UserRepositoryInterface
{
    public function all();
    public function find(int $id);
    public function create(array $data);
    public function update(int $id, array $data);
    public function delete(int $id);
}

class UserRepository implements UserRepositoryInterface
{
    public function __construct(
        private User $model
    ) {}

    public function all()
    {
        return $this->model->all();
    }

    public function findWithRelations(int $id, array $relations = [])
    {
        return $this->model->with($relations)->findOrFail($id);
    }
}
```

## 6. Checklist

```
[ ] Controllers chỉ handle HTTP (request/response)
[ ] Services chứa business logic
[ ] FormRequest cho validation
[ ] Consistent API response format
[ ] Proper error handling
[ ] Database transactions khi cần
[ ] Events cho side effects
```
