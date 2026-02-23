<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $companyRole = null;
        $permissions = [];

        if ($user = $request->user()) {
            $company = $user->getCompany();
            if ($company) {
                $membership = \App\Models\CompanyMember::where('employer_profile_id', $company->id)
                    ->where('user_id', $user->id)
                    ->active()
                    ->first();

                if ($membership) {
                    $companyRole = $membership->role;
                    $permissions = \App\Config\PermissionConfig::getAllPermissionsFor($companyRole);
                }
            }
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? $request->user()->load(['candidateProfile', 'employerProfile']) : null,
                'companyRole' => $companyRole,
                'permissions' => $permissions,
            ],
            'flash' => [
                'success' => fn() => $request->session()->get('success'),
                'error' => fn() => $request->session()->get('error'),
                'warning' => fn() => $request->session()->get('warning'),
                'info' => fn() => $request->session()->get('info'),
            ],
        ];
    }
}
