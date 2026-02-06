<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\JobAlertService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class JobAlertController extends Controller
{
    public function __construct(
        private JobAlertService $jobAlertService
    ) {
    }

    /**
     * Get list of jobs that need attention
     */
    public function index(Request $request): JsonResponse
    {
        $jobs = $this->jobAlertService->getJobsNeedingAttention(auth()->id());

        return response()->json([
            'success' => true,
            'data' => $jobs,
        ]);
    }

    /**
     * Get summary for dashboard widget
     */
    public function summary(Request $request): JsonResponse
    {
        $summary = $this->jobAlertService->getAlertSummary(auth()->id());

        return response()->json([
            'success' => true,
            'data' => $summary,
        ]);
    }
}
