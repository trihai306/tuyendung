<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\ReportService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function __construct(
        private readonly ReportService $reportService,
    ) {
    }

    public function index(Request $request): Response
    {
        $user = $request->user();
        $company = $user->getCompany();
        $ownerId = $company ? $company->user_id : $user->id;
        $companyId = $company?->id;

        $jobPostReport = $this->reportService->getJobPostReport($ownerId);
        $channelAnalytics = $this->reportService->getChannelAnalytics($ownerId);
        $memberPerformance = $companyId
            ? $this->reportService->getMemberPerformance($companyId, $ownerId)
            : [];

        return Inertia::render('Employer/Reports/Index', [
            'jobPostReport' => $jobPostReport,
            'channelAnalytics' => $channelAnalytics,
            'memberPerformance' => $memberPerformance,
        ]);
    }
}
