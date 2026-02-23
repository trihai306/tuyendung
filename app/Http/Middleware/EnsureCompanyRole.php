<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Models\CompanyMember;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureCompanyRole
{
    /**
     * Verify the user has one of the allowed roles in their company.
     *
     * Usage: middleware('company.role:owner,manager')
     *
     * Stores $company and $membership on the request for controller reuse.
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            abort(403, 'Vui long dang nhap.');
        }

        $company = $user->getCompany();
        if (!$company) {
            abort(403, 'Ban chua co thong tin cong ty.');
        }

        $membership = CompanyMember::where('employer_profile_id', $company->id)
            ->where('user_id', $user->id)
            ->active()
            ->first();

        if (!$membership || !in_array($membership->role, $roles, true)) {
            abort(403, 'Ban khong co quyen truy cap chuc nang nay.');
        }

        // Store on request so controllers don't need to re-query
        $request->attributes->set('company', $company);
        $request->attributes->set('membership', $membership);

        return $next($request);
    }
}
