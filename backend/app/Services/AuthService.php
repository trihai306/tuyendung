<?php

namespace App\Services;

use App\Models\User;
use App\Models\Company;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthService
{
    public function __construct(
        private RecruitingService $recruitingService
    ) {
    }

    /**
     * Register user with company.
     */
    public function register(array $data): array
    {
        return DB::transaction(function () use ($data) {
            // Create company first
            $company = Company::create([
                'name' => $data['company_name'],
                'slug' => Str::slug($data['company_name']) . '-' . uniqid(),
                'industry' => $data['company_industry'] ?? null,
                'phone' => $data['company_phone'] ?? null,
                'size' => '1-10',
                'verification_status' => 'pending',
            ]);

            // Create user as company owner
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'company_id' => $company->id,
                'company_role' => 'owner',
            ]);

            // Update company owner_id
            $company->update(['owner_id' => $user->id]);

            // Initialize default pipeline stages for the user
            $this->recruitingService->initializeDefaultStages($user->id);

            $token = $user->createToken('auth-token')->plainTextToken;

            return [
                'user' => $user->load('company'),
                'token' => $token,
                'message' => 'Đăng ký thành công! Doanh nghiệp của bạn đang chờ xác thực.',
            ];
        });
    }

    /**
     * Register candidate (job seeker) without company.
     */
    public function registerCandidate(array $data): array
    {
        return DB::transaction(function () use ($data) {
            // Create user without company
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'company_id' => null,
                'company_role' => null,
            ]);

            $token = $user->createToken('auth-token')->plainTextToken;

            return [
                'user' => $user,
                'token' => $token,
                'message' => 'Đăng ký thành công! Bạn có thể bắt đầu tìm việc ngay.',
            ];
        });
    }


    /**
     * Login user.
     */
    public function login(string $email, string $password, ?string $deviceName = 'default'): array
    {
        $user = User::where('email', $email)->first();

        if (!$user || !Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Thông tin đăng nhập không chính xác.'],
            ]);
        }

        // Revoke old tokens for this device
        $user->tokens()->where('name', $deviceName)->delete();

        $token = $user->createToken($deviceName)->plainTextToken;

        return [
            'user' => $user,
            'token' => $token,
        ];
    }

    /**
     * Update user profile.
     */
    public function updateProfile(User $user, array $data): User
    {
        $user->update($data);
        return $user->fresh();
    }

    /**
     * Update password with current password verification.
     */
    public function updatePassword(User $user, string $currentPassword, string $newPassword): void
    {
        if (!Hash::check($currentPassword, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Mật khẩu hiện tại không đúng.'],
            ]);
        }

        $user->update([
            'password' => Hash::make($newPassword),
        ]);

        // Revoke all other tokens
        $user->tokens()
            ->where('id', '!=', $user->currentAccessToken()->id)
            ->delete();
    }

    /**
     * Send password reset email.
     */
    public function forgotPassword(string $email): void
    {
        $user = User::where('email', $email)->first();

        if ($user) {
            $token = Str::random(64);

            DB::table('password_reset_tokens')->updateOrInsert(
                ['email' => $user->email],
                [
                    'token' => Hash::make($token),
                    'created_at' => now(),
                ]
            );

            // TODO: Send reset password email
            // Mail::to($user->email)->send(new ResetPasswordMail($token));
        }
    }

    /**
     * Logout current session.
     */
    public function logout(User $user): void
    {
        $user->currentAccessToken()->delete();
    }

    /**
     * Logout all sessions.
     */
    public function logoutAll(User $user): void
    {
        $user->tokens()->delete();
    }
}
