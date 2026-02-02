<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\RecruitingService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function __construct(
        private RecruitingService $recruitingService
    ) {
    }

    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'company_name' => 'required|string|max:255',
            'company_industry' => 'nullable|string|max:255',
            'company_phone' => 'nullable|string|max:20',
        ]);

        // Create company first
        $company = \App\Models\Company::create([
            'name' => $validated['company_name'],
            'slug' => \Illuminate\Support\Str::slug($validated['company_name']) . '-' . uniqid(),
            'industry' => $validated['company_industry'] ?? null,
            'phone' => $validated['company_phone'] ?? null,
            'size' => '1-10',
            'verification_status' => 'pending',
        ]);

        // Create user as company owner
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'company_id' => $company->id,
            'company_role' => 'owner',
        ]);

        // Update company owner_id
        $company->update(['owner_id' => $user->id]);

        // Initialize default pipeline stages for the user
        $this->recruitingService->initializeDefaultStages($user->id);

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'data' => [
                'user' => $user->load('company'),
                'token' => $token,
                'message' => 'Đăng ký thành công! Doanh nghiệp của bạn đang chờ xác thực.',
            ],
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
            'device_name' => 'nullable|string',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Thông tin đăng nhập không chính xác.'],
            ]);
        }

        // Revoke old tokens for this device
        $deviceName = $validated['device_name'] ?? 'default';
        $user->tokens()->where('name', $deviceName)->delete();

        $token = $user->createToken($deviceName)->plainTextToken;

        return response()->json([
            'data' => [
                'user' => $user,
                'token' => $token,
            ],
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'data' => $request->user(),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(null, 204);
    }

    public function logoutAll(Request $request): JsonResponse
    {
        $request->user()->tokens()->delete();

        return response()->json(null, 204);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $request->user()->id,
            'avatar_url' => 'nullable|url',
        ]);

        $request->user()->update($validated);

        return response()->json([
            'data' => $request->user()->fresh(),
        ]);
    }

    public function updatePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if (!Hash::check($validated['current_password'], $request->user()->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Mật khẩu hiện tại không đúng.'],
            ]);
        }

        $request->user()->update([
            'password' => Hash::make($validated['password']),
        ]);

        // Revoke all other tokens
        $request->user()->tokens()
            ->where('id', '!=', $request->user()->currentAccessToken()->id)
            ->delete();

        return response()->json([
            'message' => 'Đổi mật khẩu thành công.',
        ]);
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if ($user) {
            // Generate reset token
            $token = \Illuminate\Support\Str::random(64);

            // Store token in password_reset_tokens table
            \DB::table('password_reset_tokens')->updateOrInsert(
                ['email' => $user->email],
                [
                    'token' => Hash::make($token),
                    'created_at' => now(),
                ]
            );

            // TODO: Send reset password email
            // Mail::to($user->email)->send(new ResetPasswordMail($token));
        }

        // Always return success to prevent email enumeration
        return response()->json([
            'message' => 'Nếu email tồn tại, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu.',
        ]);
    }
}

