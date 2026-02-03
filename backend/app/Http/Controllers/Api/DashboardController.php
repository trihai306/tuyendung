<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(
        private DashboardService $dashboardService
    ) {
    }

    /**
     * Get personal stats for the current member.
     */
    public function myStats(Request $request): JsonResponse
    {
        $stats = $this->dashboardService->getMemberStats($request->user());

        return response()->json([
            'data' => $stats,
        ]);
    }

    /**
     * Get pending tasks for the current member.
     */
    public function tasks(Request $request): JsonResponse
    {
        $tasks = $this->dashboardService->getTasks($request->user());

        return response()->json([
            'data' => $tasks,
        ]);
    }

    /**
     * Get upcoming interviews for the current member.
     */
    public function interviews(Request $request): JsonResponse
    {
        $interviews = $this->dashboardService->getInterviews($request->user());

        return response()->json([
            'data' => $interviews,
        ]);
    }
}
