<?php

namespace App\Services;

use App\Models\Company;
use App\Models\CompanySeat;
use App\Models\SeatPackage;
use App\Models\User;
use App\Models\UserSeatAssignment;
use Illuminate\Support\Facades\DB;

class SeatService
{
    /**
     * Get seat pricing information.
     */
    public function getPricing(): array
    {
        $package = SeatPackage::active()->first();

        if (!$package) {
            return [
                'price_per_seat' => 500000,
                'formatted_price' => '500.000 ₫',
                'duration_days' => 30,
                'features' => [
                    'Tin nhắn không giới hạn',
                    'Đăng bài tự động Facebook/Zalo',
                    'Lên lịch đăng bài',
                    'AI tự động trả lời',
                    'Thống kê bằng AI',
                ],
            ];
        }

        return [
            'price_per_seat' => $package->price_per_seat,
            'formatted_price' => $package->formatted_price,
            'duration_days' => $package->duration_days,
            'features' => $package->features,
        ];
    }

    /**
     * Get company's current seat allocation.
     */
    public function getCompanySeats(int $companyId): array
    {
        $companySeat = CompanySeat::where('company_id', $companyId)
            ->active()
            ->first();

        $assignments = UserSeatAssignment::where('company_id', $companyId)
            ->active()
            ->with('user:id,name,email')
            ->get();

        $companyUsers = User::where('company_id', $companyId)
            ->select('id', 'name', 'email')
            ->get();

        return [
            'has_seats' => $companySeat !== null,
            'total_seats' => $companySeat?->total_seats ?? 0,
            'used_seats' => $companySeat?->used_seats ?? 0,
            'available_seats' => $companySeat?->available_seats ?? 0,
            'price_per_seat' => $companySeat?->price_per_seat ?? 500000,
            'expires_at' => $companySeat?->expires_at,
            'status' => $companySeat?->status ?? 'none',
            'assigned_users' => $assignments->map(fn($a) => [
                'id' => $a->user->id,
                'name' => $a->user->name,
                'email' => $a->user->email,
                'assigned_at' => $a->assigned_at,
            ]),
            'company_users' => $companyUsers,
        ];
    }

    /**
     * Purchase seats for company.
     */
    public function purchaseSeats(int $companyId, int $quantity): array
    {
        $package = SeatPackage::active()->first();
        $pricePerSeat = $package?->price_per_seat ?? 500000;
        $durationDays = $package?->duration_days ?? 30;
        $totalAmount = $pricePerSeat * $quantity;

        return DB::transaction(function () use ($companyId, $quantity, $pricePerSeat, $durationDays, $totalAmount) {
            $existingSeat = CompanySeat::where('company_id', $companyId)
                ->active()
                ->first();

            if ($existingSeat) {
                $existingSeat->increment('total_seats', $quantity);
                $existingSeat->total_amount += $totalAmount;
                $existingSeat->save();
                $companySeat = $existingSeat;
            } else {
                $companySeat = CompanySeat::create([
                    'company_id' => $companyId,
                    'total_seats' => $quantity,
                    'used_seats' => 0,
                    'price_per_seat' => $pricePerSeat,
                    'starts_at' => now(),
                    'expires_at' => now()->addDays($durationDays),
                    'status' => 'pending',
                    'total_amount' => $totalAmount,
                ]);
            }

            return [
                'seats_purchased' => $quantity,
                'price_per_seat' => $pricePerSeat,
                'total_amount' => $totalAmount,
                'formatted_total' => number_format($totalAmount, 0, ',', '.') . ' ₫',
                'status' => $companySeat->status,
                'expires_at' => $companySeat->expires_at,
                'requires_payment' => $companySeat->status === 'pending',
                'message' => $companySeat->status === 'pending'
                    ? 'Vui lòng thanh toán ' . number_format($totalAmount, 0, ',', '.') . '₫ để kích hoạt.'
                    : 'Đã thêm ' . $quantity . ' seats thành công!',
            ];
        });
    }

    /**
     * Assign user to a seat.
     */
    public function assignSeat(int $companyId, int $targetUserId, int $assignedBy): array
    {
        // Check target user belongs to same company
        $targetUser = User::where('id', $targetUserId)
            ->where('company_id', $companyId)
            ->first();

        if (!$targetUser) {
            throw new \InvalidArgumentException('User không thuộc công ty của bạn.');
        }

        // Check available seats
        $companySeat = CompanySeat::where('company_id', $companyId)
            ->active()
            ->first();

        if (!$companySeat || $companySeat->available_seats <= 0) {
            throw new \InvalidArgumentException('Không còn seats trống. Vui lòng mua thêm.');
        }

        // Check if already assigned
        $existing = UserSeatAssignment::where('company_id', $companyId)
            ->where('user_id', $targetUserId)
            ->where('is_active', true)
            ->first();

        if ($existing) {
            throw new \InvalidArgumentException('User đã được gán seat.');
        }

        return DB::transaction(function () use ($companyId, $targetUserId, $assignedBy, $targetUser, $companySeat) {
            UserSeatAssignment::create([
                'company_id' => $companyId,
                'user_id' => $targetUserId,
                'assigned_by' => $assignedBy,
                'is_active' => true,
                'assigned_at' => now(),
            ]);

            $companySeat->increment('used_seats');

            return [
                'message' => 'Đã gán seat cho ' . $targetUser->name,
                'remaining_seats' => $companySeat->available_seats - 1,
            ];
        });
    }

    /**
     * Unassign user from seat.
     */
    public function unassignSeat(int $companyId, int $targetUserId): array
    {
        $assignment = UserSeatAssignment::where('company_id', $companyId)
            ->where('user_id', $targetUserId)
            ->where('is_active', true)
            ->first();

        if (!$assignment) {
            throw new \InvalidArgumentException('User chưa được gán seat.');
        }

        return DB::transaction(function () use ($companyId, $assignment) {
            $assignment->update([
                'is_active' => false,
                'unassigned_at' => now(),
            ]);

            $companySeat = CompanySeat::where('company_id', $companyId)
                ->active()
                ->first();

            if ($companySeat && $companySeat->used_seats > 0) {
                $companySeat->decrement('used_seats');
            }

            return [
                'message' => 'Đã bỏ gán seat.',
                'available_seats' => ($companySeat?->available_seats ?? 0) + 1,
            ];
        });
    }
}
