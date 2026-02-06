<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PackageService;
use Illuminate\Http\JsonResponse;

class PackageController extends Controller
{
    public function __construct(
        private PackageService $packageService
    ) {
    }

    /**
     * Get all active packages
     */
    public function index(): JsonResponse
    {
        $packages = $this->packageService->getActivePackages();

        return response()->json([
            'data' => $packages,
        ]);
    }

    /**
     * Get package by slug
     */
    public function show(string $slug): JsonResponse
    {
        $package = $this->packageService->getPackageBySlug($slug);

        if (!$package) {
            return response()->json(['message' => 'Gói không tồn tại'], 404);
        }

        return response()->json([
            'data' => $package,
        ]);
    }
}
