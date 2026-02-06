<?php

namespace App\Services;

use App\Models\Package;
use Illuminate\Support\Collection;

class PackageService
{
    /**
     * Get all active packages
     */
    public function getActivePackages(): Collection
    {
        return Package::active()
            ->orderBy('sort_order')
            ->get()
            ->map(fn($package) => $this->formatPackageData($package));
    }

    /**
     * Get package by slug
     */
    public function getPackageBySlug(string $slug): ?array
    {
        $package = Package::where('slug', $slug)->active()->first();

        if (!$package) {
            return null;
        }

        return $this->formatPackageData($package);
    }

    /**
     * Format package data for API response
     */
    public function formatPackageData(Package $package): array
    {
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
    }
}
