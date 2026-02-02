<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Package;
use App\Models\Subscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SubscriptionController extends Controller
{
    /**
     * Get current company subscription
     */
    public function show(): JsonResponse
    {
        $user = Auth::user();

        if (!$user->company_id) {
            return response()->json(['message' => 'Bạn chưa thuộc doanh nghiệp nào'], 400);
        }

        $subscription = Subscription::with('package')
            ->where('company_id', $user->company_id)
            ->active()
            ->first();

        if (!$subscription) {
            // Return starter package info for companies without subscription
            $starterPackage = Package::where('slug', 'starter')->first();

            return response()->json([
                'data' => [
                    'has_subscription' => false,
                    'current_plan' => 'starter',
                    'package' => $starterPackage ? [
                        'name' => $starterPackage->name,
                        'max_jobs' => $starterPackage->max_jobs,
                        'max_candidates' => $starterPackage->max_candidates,
                        'max_users' => $starterPackage->max_users,
                        'features' => $starterPackage->features,
                    ] : null,
                    'message' => 'Bạn đang sử dụng gói Starter miễn phí',
                ],
            ]);
        }

        return response()->json([
            'data' => [
                'has_subscription' => true,
                'id' => $subscription->id,
                'current_plan' => $subscription->package->slug,
                'package' => [
                    'name' => $subscription->package->name,
                    'slug' => $subscription->package->slug,
                    'max_jobs' => $subscription->package->max_jobs,
                    'max_candidates' => $subscription->package->max_candidates,
                    'max_users' => $subscription->package->max_users,
                    'features' => $subscription->package->features,
                ],
                'starts_at' => $subscription->starts_at->toISOString(),
                'expires_at' => $subscription->expires_at->toISOString(),
                'days_remaining' => $subscription->daysRemaining(),
                'status' => $subscription->status,
                'amount_paid' => $subscription->amount_paid,
            ],
        ]);
    }

    /**
     * Subscribe to a package
     */
    public function store(Request $request): JsonResponse
    {
        $user = Auth::user();

        if (!$user->company_id) {
            return response()->json(['message' => 'Bạn chưa thuộc doanh nghiệp nào'], 400);
        }

        if ($user->company_role !== 'owner') {
            return response()->json(['message' => 'Chỉ chủ doanh nghiệp mới có thể đăng ký gói'], 403);
        }

        $validated = $request->validate([
            'package_slug' => 'required|exists:packages,slug',
        ]);

        $package = Package::where('slug', $validated['package_slug'])->active()->first();

        if (!$package) {
            return response()->json(['message' => 'Gói không tồn tại hoặc đã ngừng bán'], 404);
        }

        // Check for existing active subscription
        $existingSubscription = Subscription::where('company_id', $user->company_id)
            ->active()
            ->first();

        if ($existingSubscription) {
            return response()->json([
                'message' => 'Bạn đang có gói subscription đang hoạt động',
                'data' => [
                    'current_package' => $existingSubscription->package->name,
                    'expires_at' => $existingSubscription->expires_at->toISOString(),
                ],
            ], 400);
        }

        // For paid packages, redirect to payment (TODO: implement payment gateway)
        if ($package->price > 0) {
            return response()->json([
                'data' => [
                    'requires_payment' => true,
                    'package' => [
                        'name' => $package->name,
                        'price' => $package->price,
                        'formatted_price' => $package->formatted_price,
                    ],
                    'payment_url' => null, // TODO: Generate payment URL
                    'message' => 'Vui lòng thanh toán để kích hoạt gói ' . $package->name,
                ],
            ]);
        }

        // Free package - activate immediately
        $subscription = Subscription::create([
            'company_id' => $user->company_id,
            'package_id' => $package->id,
            'starts_at' => now(),
            'expires_at' => now()->addDays($package->duration_days),
            'status' => 'active',
            'amount_paid' => 0,
        ]);

        return response()->json([
            'data' => [
                'subscription' => $subscription->load('package'),
                'message' => 'Đã kích hoạt gói ' . $package->name . ' thành công!',
            ],
        ], 201);
    }

    /**
     * Cancel subscription
     */
    public function cancel(): JsonResponse
    {
        $user = Auth::user();

        if (!$user->company_id) {
            return response()->json(['message' => 'Bạn chưa thuộc doanh nghiệp nào'], 400);
        }

        if ($user->company_role !== 'owner') {
            return response()->json(['message' => 'Chỉ chủ doanh nghiệp mới có thể hủy gói'], 403);
        }

        $subscription = Subscription::where('company_id', $user->company_id)
            ->active()
            ->first();

        if (!$subscription) {
            return response()->json(['message' => 'Không có gói nào đang hoạt động'], 404);
        }

        $subscription->update(['status' => 'cancelled']);

        return response()->json([
            'data' => [
                'message' => 'Đã hủy gói thành công. Bạn vẫn có thể sử dụng đến ' . $subscription->expires_at->format('d/m/Y'),
            ],
        ]);
    }
}
