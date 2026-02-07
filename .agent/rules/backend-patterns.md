---
trigger: always_on
glob: backend/app/**/*.php
description: Design patterns chuẩn cho Laravel Backend - Controller-Service pattern
---

# Rules: Backend Design Patterns (Laravel)

## 1. Controller-Service Pattern

```
app/
├── Http/Controllers/Api/   # API Controllers (chỉ handle HTTP)
├── Services/               # Business Logic
├── Models/                 # Eloquent Models
├── Http/Requests/          # FormRequest validation
├── Http/Resources/         # API Resource transformers
└── Policies/               # Authorization
```

### Controller: Chỉ handle HTTP layer
```php
class UserController extends Controller
{
    public function __construct(private UserService $userService) {}

    public function store(StoreUserRequest $request)
    {
        $user = $this->userService->createUser($request->validated());
        return $this->success($user, 'User created', 201);
    }
    // ❌ KHÔNG: validation, queries, email trong controller
}
```

### Service: Chứa business logic
```php
class UserService
{
    public function createUser(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $user = User::create([...$data, 'password' => Hash::make($data['password'])]);
            $user->profile()->create(['bio' => $data['bio'] ?? null]);
            event(new UserCreated($user));
            return $user;
        });
    }
}
```

## 2. FormRequest Validation

```php
class StoreUserRequest extends FormRequest
{
    public function authorize(): bool { return true; }

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

### ApiResponse Trait (sử dụng trong Controller)
```php
trait ApiResponse
{
    protected function success($data, string $message = 'Success', int $code = 200)
    {
        return response()->json(['success' => true, 'data' => $data, 'message' => $message], $code);
    }

    protected function error(string $message, int $code = 400, $errors = null)
    {
        return response()->json(['success' => false, 'error' => ['message' => $message, 'details' => $errors]], $code);
    }
}
```

### Paginated Response
```php
return response()->json([
    'success' => true,
    'data' => $collection->items(),
    'meta' => [
        'current_page' => $collection->currentPage(),
        'per_page' => $collection->perPage(),
        'total' => $collection->total(),
        'last_page' => $collection->lastPage(),
    ],
]);
```

## 4. Error Handling

```php
// app/Exceptions/Handler.php - cho API requests
if ($request->expectsJson()) {
    if ($exception instanceof ValidationException) {
        return response()->json(['success' => false, 'error' => ['code' => 'VALIDATION_ERROR', 'details' => $exception->errors()]], 422);
    }
    if ($exception instanceof ModelNotFoundException) {
        return response()->json(['success' => false, 'error' => ['code' => 'NOT_FOUND', 'message' => 'Resource not found']], 404);
    }
}
```

## 5. Model Conventions

### Structure: $fillable, $casts, $hidden, Accessors
```php
class RecruitmentJob extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['company_id', 'title', 'department', 'location', 'employment_type',
        'salary_min', 'salary_max', 'description', 'requirements', 'benefits', 'status'];

    protected $casts = ['salary_min' => 'integer', 'salary_max' => 'integer',
        'deadline' => 'datetime', 'is_featured' => 'boolean', 'metadata' => 'array', 'tags' => 'array'];

    protected $hidden = ['deleted_at'];
    protected $appends = ['salary_range'];

    public function getSalaryRangeAttribute(): string
    {
        if (!$this->salary_min && !$this->salary_max) return 'Thỏa thuận';
        return number_format($this->salary_min) . ' - ' . number_format($this->salary_max);
    }
}
```

### Query Scopes
```php
class Candidate extends Model
{
    public function scopeActive($query) { return $query->where('status', 'active'); }
    public function scopeBySource($query, string $source) { return $query->where('source', $source); }
    public function scopeForCompany($query, int $companyId) { return $query->where('company_id', $companyId); }
    public function scopeSearch($query, ?string $term)
    {
        if (!$term) return $query;
        return $query->where(fn($q) => $q->where('full_name', 'like', "%{$term}%")
            ->orWhere('email', 'like', "%{$term}%")->orWhere('phone', 'like', "%{$term}%"));
    }
}
// Usage: Candidate::active()->bySource('chat')->search($term)->forCompany($id)->paginate(15);
```

### Relations
```php
class Company extends Model
{
    public function jobs(): HasMany { return $this->hasMany(RecruitmentJob::class); }
    public function users(): BelongsToMany { return $this->belongsToMany(User::class, 'company_user')->withPivot('role')->withTimestamps(); }
    public function candidates(): HasMany { return $this->hasMany(Candidate::class); }
}

class RecruitmentJob extends Model
{
    public function company(): BelongsTo { return $this->belongsTo(Company::class); }
    public function createdBy(): BelongsTo { return $this->belongsTo(User::class, 'created_by_user_id'); }
    public function applications(): HasMany { return $this->hasMany(JobApplication::class); }
}
```

## 6. Policies (Authorization)

```php
class CandidatePolicy
{
    public function viewAny(User $user): bool { return $user->hasCompany(); }
    public function view(User $user, Candidate $candidate): bool
    {
        if ($user->isCompanyMember()) return $candidate->assigned_user_id === $user->id;
        return $user->company_id === $candidate->company_id;
    }
    public function create(User $user): bool { return $user->hasCompany(); }
    public function update(User $user, Candidate $candidate): bool
    {
        if (!$user->hasCompany()) return false;
        if ($user->isCompanyMember()) return $candidate->assigned_user_id === $user->id;
        return $user->company_id === $candidate->company_id;
    }
    public function delete(User $user, Candidate $candidate): bool
    {
        return $user->isCompanyManager() && $user->company_id === $candidate->company_id;
    }
}

// Controller: $this->authorize('viewAny', Candidate::class);
```

## 7. Middleware

```php
class EnsureUserHasCompany
{
    public function handle(Request $request, Closure $next)
    {
        if (!$request->user()?->hasCompany()) {
            return response()->json(['success' => false, 'error' => ['code' => 'NO_COMPANY', 'message' => 'Cần tạo/tham gia công ty']], 403);
        }
        return $next($request);
    }
}

// bootstrap/app.php (Laravel 11+)
->withMiddleware(fn(Middleware $m) => $m->alias([
    'has.company' => EnsureUserHasCompany::class,
    'company.role' => CheckCompanyRole::class,
]))

// Routes
Route::middleware(['auth:sanctum', 'has.company'])->group(fn() => Route::apiResource('candidates', CandidateController::class));
Route::middleware(['auth:sanctum', 'company.role:owner,admin'])->group(fn() => Route::post('/company/invite', [CompanyController::class, 'invite']));
```

## 8. Resource Classes

```php
class CandidateResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id, 'full_name' => $this->full_name, 'email' => $this->email,
            'phone' => $this->phone, 'source' => $this->source, 'status' => $this->status,
            'rating' => $this->rating, 'tags' => $this->tags ?? [],
            'applications' => ApplicationResource::collection($this->whenLoaded('applications')),
            'assigned_user' => new UserResource($this->whenLoaded('assignedUser')),
            'created_at' => $this->created_at->toISOString(),
        ];
    }
}

// Controller: return new CandidateCollection($candidates);
```

## 9. Events & Listeners

```php
// Event: app/Events/CandidateCreated.php
class CandidateCreated { use Dispatchable, SerializesModels; public function __construct(public Candidate $candidate) {} }

// Listener: app/Listeners/SendNewCandidateNotification.php
class SendNewCandidateNotification {
    public function handle(CandidateCreated $event): void {
        $owner = $event->candidate->company->users()->wherePivot('role', 'owner')->first();
        $owner?->notify(new NewCandidateNotification($event->candidate));
    }
}

// EventServiceProvider: CandidateCreated::class => [SendNewCandidateNotification::class]
```

## Checklist

```
[ ] Controllers chỉ handle HTTP, Services chứa business logic
[ ] FormRequest cho validation, Resources cho API output
[ ] Consistent API response format (ApiResponse trait)
[ ] Models có $fillable, $casts, $hidden, Query Scopes
[ ] Relations định nghĩa đúng foreign keys
[ ] Policies cho authorization, Middleware cho access control
[ ] Events cho side effects, DB transactions khi cần
```
