<?php

namespace App\Services;

use App\Models\Package;
use App\Models\Subscription;
use App\Models\User;

class SubscriptionService
{
    public function __construct(
        private PackageService $packageService
    ) {
    }

    /**
     * Get current subscription for company
     */
    public function getCurrentSubscription(int $companyId): array
    {
        $subscription = Subscription::with('package')
            ->where('company_id', $companyId)
            ->active()
            ->first();

        if (!$subscription) {
            return $this->getStarterPackageInfo();
        }

        return [
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
        ];
    }

    /**
     * Subscribe to a package
     */
    public function subscribe(int $companyId, string $packageSlug, User $user): array
    {
        // Verify user is owner
        if ($user->company_role !== 'owner') {
            throw new \Exception('Chỉ chủ doanh nghiệp mới có thể đăng ký gói', 403);
        }

        $package = Package::where('slug', $packageSlug)->active()->first();

        if (!$package) {
            throw new \Exception('Gói không tồn tại hoặc đã ngừng bán', 404);
        }

        // Check for existing active subscription
        $existingSubscription = Subscription::where('company_id', $companyId)
            ->active()
            ->first();

        if ($existingSubscription) {
            return [
                'error' => true,
                'message' => 'Bạn đang có gói subscription đang hoạt động',
                'current_package' => $existingSubscription->package->name,
                'expires_at' => $existingSubscription->expires_at->toISOString(),
            ];
        }

        // For paid packages, redirect to payment
        if ($package->price > 0) {
            return [
                'requires_payment' => true,
                'package' => [
                    'name' => $package->name,
                    'price' => $package->price,
                    'formatted_price' => $package->formatted_price,
                ],
                'payment_url' => null,
                'message' => 'Vui lòng thanh toán để kích hoạt gói ' . $package->name,
            ];
        }

        // Free package - activate immediately
        $subscription = Subscription::create([
            'company_id' => $companyId,
            'package_id' => $package->id,
            'starts_at' => now(),
            'expires_at' => now()->addDays($package->duration_days),
            'status' => 'active',
            'amount_paid' => 0,
        ]);

        return [
            'subscription' => $subscription->load('package'),
            'message' => 'Đã kích hoạt gói ' . $package->name . ' thành công!',
        ];
    }

    /**
     * Cancel subscription
     */
    public function cancelSubscription(int $companyId, User $user): array
    {
        if ($user->company_role !== 'owner') {
            throw new \Exception('Chỉ chủ doanh nghiệp mới có thể hủy gói', 403);
        }

        $subscription = Subscription::where('company_id', $companyId)
            ->active()
            ->first();

        if (!$subscription) {
            throw new \Exception('Không có gói nào đang hoạt động', 404);
        }

        $subscription->update(['status' => 'cancelled']);

        return [
            'message' => 'Đã hủy gói thành công. Bạn vẫn có thể sử dụng đến ' . $subscription->expires_at->format('d/m/Y'),
        ];
    }

    /**
     * Get starter package info for companies without subscription
     */
    private function getStarterPackageInfo(): array
    {
        $starterPackage = Package::where('slug', 'starter')->first();

        return [
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
        ];
    }
}
