<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\DashboardService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private readonly DashboardService $dashboardService,
    ) {
    }

    public function index(Request $request): Response
    {
        $user = $request->user();
        $data = [];

        if ($user->isCandidate()) {
            $data['candidate'] = $this->dashboardService->getCandidateData($user);
        }

        if ($user->isEmployer()) {
            $data['employer'] = $this->dashboardService->getEmployerData($user);
        }

        if ($user->isLandlord()) {
            $data['landlord'] = $this->dashboardService->getLandlordData($user);
        }

        return Inertia::render('Dashboard', $data);
    }
}
