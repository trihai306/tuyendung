<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Package;
use Illuminate\Http\JsonResponse;

class PackageController extends Controller
{
    /**
     * Get all active packages
     */
    public function index(): JsonResponse
    {
        $packages = Package::active()
            ->orderBy('sort_order')
            ->get()
            ->map(function ($package) {
                return [
                    'id' => $package->id,
                    'name' => $package->name,
                    'slug' => $package->slug,
                    'description' => $package->description,
                    'price' => $package->price,
                    'formatted_price' => $package->formatted_price,
                    'duration_days' => $package->duration_days,
                    'max_jobs' => $package->max_jobs,
                    'max_jobs_display' => $package->max_jobs === -1 ? 'Không giới hạn' : $package->max_jobs,
                    'max_candidates' => $package->max_candidates,
                    'max_candidates_display' => $package->max_candidates === -1 ? 'Không giới hạn' : $package->max_candidates,
                    'max_users' => $package->max_users,
                    'features' => $package->features,
                    'is_popular' => $package->is_popular,
                ];
            });

        return response()->json([
            'data' => $packages,
        ]);
    }

    /**
     * Get package by slug
     */
    public function show(string $slug): JsonResponse
    {
        $package = Package::where('slug', $slug)->active()->first();

        if (!$package) {
            return response()->json(['message' => 'Gói không tồn tại'], 404);
        }

        return response()->json([
            'data' => [
                'id' => $package->id,
                'name' => $package->name,
                'slug' => $package->slug,
                'description' => $package->description,
                'price' => $package->price,
                'formatted_price' => $package->formatted_price,
                'duration_days' => $package->duration_days,
                'max_jobs' => $package->max_jobs,
                'max_jobs_display' => $package->max_jobs === -1 ? 'Không giới hạn' : $package->max_jobs,
                'max_candidates' => $package->max_candidates,
                'max_candidates_display' => $package->max_candidates === -1 ? 'Không giới hạn' : $package->max_candidates,
                'max_users' => $package->max_users,
                'features' => $package->features,
                'is_popular' => $package->is_popular,
            ],
        ]);
    }
}
