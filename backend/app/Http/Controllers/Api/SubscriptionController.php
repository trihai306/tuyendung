<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SubscriptionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SubscriptionController extends Controller
{
    public function __construct(
        private SubscriptionService $subscriptionService
    ) {
    }

    /**
     * Get current company subscription
     */
    public function show(): JsonResponse
    {
        $user = Auth::user();

        if (!$user->company_id) {
            return response()->json(['message' => 'Bạn chưa thuộc doanh nghiệp nào'], 400);
        }

        $subscription = $this->subscriptionService->getCurrentSubscription($user->company_id);

        return response()->json(['data' => $subscription]);
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

        $validated = $request->validate([
            'package_slug' => 'required|exists:packages,slug',
        ]);

        try {
            $result = $this->subscriptionService->subscribe(
                $user->company_id,
                $validated['package_slug'],
                $user
            );

            if (isset($result['error'])) {
                return response()->json([
                    'message' => $result['message'],
                    'data' => [
                        'current_package' => $result['current_package'],
                        'expires_at' => $result['expires_at'],
                    ],
                ], 400);
            }

            if (isset($result['requires_payment'])) {
                return response()->json(['data' => $result]);
            }

            return response()->json(['data' => $result], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], $e->getCode() ?: 400);
        }
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

        try {
            $result = $this->subscriptionService->cancelSubscription($user->company_id, $user);

            return response()->json(['data' => $result]);
        } catch (\Exception $e) {
            $code = $e->getCode() ?: 400;
            return response()->json(['message' => $e->getMessage()], $code);
        }
    }
}
