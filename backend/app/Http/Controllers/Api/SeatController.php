<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SeatPackage;
use App\Models\CompanySeat;
use App\Models\UserSeatAssignment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class SeatController extends Controller
{
    /**
     * Get seat pricing info
     */
    public function getPricing(): JsonResponse
    {
        $package = SeatPackage::active()->first();

        if (!$package) {
            // Default pricing if no package exists
            return response()->json([
                'success' => true,
                'data' => [
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
                ],
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'price_per_seat' => $package->price_per_seat,
                'formatted_price' => $package->formatted_price,
                'duration_days' => $package->duration_days,
                'features' => $package->features,
            ],
        ]);
    }

    /**
     * Get company's current seat info
     */
    public function getCompanySeats(Request $request): JsonResponse
    {
        $user = $request->user();
        $companyId = $user->company_id;

        $companySeat = CompanySeat::where('company_id', $companyId)
            ->active()
            ->first();

        $assignments = UserSeatAssignment::where('company_id', $companyId)
            ->active()
            ->with('user:id,name,email')
            ->get();

        // Get all company users
        $companyUsers = User::where('company_id', $companyId)
            ->select('id', 'name', 'email')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
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
            ],
        ]);
    }

    /**
     * Purchase seats
     */
    public function purchaseSeats(Request $request): JsonResponse
    {
        $request->validate([
            'quantity' => 'required|integer|min:1|max:100',
        ]);

        $user = $request->user();
        $companyId = $user->company_id;
        $quantity = $request->quantity;

        $package = SeatPackage::active()->first();
        $pricePerSeat = $package?->price_per_seat ?? 500000;
        $durationDays = $package?->duration_days ?? 30;

        $totalAmount = $pricePerSeat * $quantity;

        DB::beginTransaction();
        try {
            // Check if company already has active seats
            $existingSeat = CompanySeat::where('company_id', $companyId)
                ->active()
                ->first();

            if ($existingSeat) {
                // Add to existing seats
                $existingSeat->increment('total_seats', $quantity);
                $existingSeat->total_amount += $totalAmount;
                $existingSeat->save();

                $companySeat = $existingSeat;
            } else {
                // Create new seat purchase (pending payment)
                $companySeat = CompanySeat::create([
                    'company_id' => $companyId,
                    'total_seats' => $quantity,
                    'used_seats' => 0,
                    'price_per_seat' => $pricePerSeat,
                    'starts_at' => now(),
                    'expires_at' => now()->addDays($durationDays),
                    'status' => 'pending', // Pending payment
                    'total_amount' => $totalAmount,
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => [
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
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Assign user to a seat
     */
    public function assignSeat(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $currentUser = $request->user();
        $companyId = $currentUser->company_id;
        $targetUserId = $request->user_id;

        // Check target user belongs to same company
        $targetUser = User::where('id', $targetUserId)
            ->where('company_id', $companyId)
            ->first();

        if (!$targetUser) {
            return response()->json([
                'success' => false,
                'message' => 'User không thuộc công ty của bạn.',
            ], 400);
        }

        // Check available seats
        $companySeat = CompanySeat::where('company_id', $companyId)
            ->active()
            ->first();

        if (!$companySeat || $companySeat->available_seats <= 0) {
            return response()->json([
                'success' => false,
                'message' => 'Không còn seats trống. Vui lòng mua thêm.',
            ], 400);
        }

        // Check if already assigned
        $existing = UserSeatAssignment::where('company_id', $companyId)
            ->where('user_id', $targetUserId)
            ->where('is_active', true)
            ->first();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'User đã được gán seat.',
            ], 400);
        }

        DB::beginTransaction();
        try {
            UserSeatAssignment::create([
                'company_id' => $companyId,
                'user_id' => $targetUserId,
                'assigned_by' => $currentUser->id,
                'is_active' => true,
                'assigned_at' => now(),
            ]);

            $companySeat->increment('used_seats');

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Đã gán seat cho ' . $targetUser->name,
                'data' => [
                    'remaining_seats' => $companySeat->available_seats - 1,
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra.',
            ], 500);
        }
    }

    /**
     * Unassign user from seat
     */
    public function unassignSeat(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $currentUser = $request->user();
        $companyId = $currentUser->company_id;
        $targetUserId = $request->user_id;

        $assignment = UserSeatAssignment::where('company_id', $companyId)
            ->where('user_id', $targetUserId)
            ->where('is_active', true)
            ->first();

        if (!$assignment) {
            return response()->json([
                'success' => false,
                'message' => 'User chưa được gán seat.',
            ], 400);
        }

        DB::beginTransaction();
        try {
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

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Đã bỏ gán seat.',
                'data' => [
                    'available_seats' => ($companySeat?->available_seats ?? 0) + 1,
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra.',
            ], 500);
        }
    }
}
