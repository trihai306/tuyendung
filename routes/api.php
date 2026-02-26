<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;
use Illuminate\Validation\ValidationException;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Token-based API routes for external clients (Electron AutoApp, mobile).
| Uses Laravel Sanctum for authentication.
|
*/

// --- Public Auth ---

Route::prefix('auth')->group(function (): void {

    Route::post('/login', function (Request $request): JsonResponse {
        $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
            'device_name' => ['required', 'string'],
        ]);

        /** @var User|null $user */
        $user = User::where('email', $request->string('email'))->first();

        if (!$user || !Hash::check($request->string('password')->toString(), $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Thong tin dang nhap khong chinh xac.'],
            ]);
        }

        $token = $user->createToken($request->string('device_name')->toString())->plainTextToken;

        return response()->json([
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'avatar_url' => $user->avatar_url ?? null,
                    'company_id' => $user->company_id ?? null,
                ],
                'token' => $token,
            ],
        ]);
    });

});

// --- Protected Routes ---

Route::middleware('auth:sanctum')->group(function (): void {

    Route::get('/auth/me', function (Request $request): JsonResponse {
        $user = $request->user();

        return response()->json([
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar_url' => $user->avatar_url ?? null,
                'company_id' => $user->company_id ?? null,
            ],
        ]);
    });

    Route::post('/auth/logout', function (Request $request): JsonResponse {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out'], 200);
    });

    // --- Agent Profiles (future: sync profiles from DB) ---
    Route::get('/agent/profiles', function (Request $request): JsonResponse {
        // Placeholder: return user info for agent profile management
        return response()->json([
            'data' => [
                'user_id' => $request->user()->id,
                'profiles' => [],
            ],
        ]);
    });

    // --- Pusher Auth for private channels ---
    Route::post('/broadcasting/auth', function (Request $request) {
        return \Illuminate\Support\Facades\Broadcast::auth($request);
    });
});
