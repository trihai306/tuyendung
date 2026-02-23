<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\CandidateProfile;
use App\Models\EmployerProfile;
use App\Models\CompanyMember;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'account_type' => 'required|string|in:employer,candidate',
        ];

        // Additional validation for employer accounts
        if ($request->account_type === 'employer') {
            $rules['company_name'] = 'required|string|max:255';
            $rules['phone'] = 'nullable|string|max:20';
        }

        $request->validate($rules);

        $user = DB::transaction(function () use ($request): User {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
                'password' => Hash::make($request->password),
                'roles' => [$request->account_type],
            ]);

            // Auto-create corresponding profile
            if ($request->account_type === 'employer') {
                $profile = EmployerProfile::create([
                    'user_id' => $user->id,
                    'company_name' => $request->company_name,
                    'contact_email' => $request->email,
                    'contact_phone' => $request->phone,
                ]);

                // Auto-create owner membership
                CompanyMember::create([
                    'employer_profile_id' => $profile->id,
                    'user_id' => $user->id,
                    'role' => 'owner',
                    'status' => 'active',
                    'invited_at' => now(),
                    'joined_at' => now(),
                ]);
            } else {
                CandidateProfile::create([
                    'user_id' => $user->id,
                ]);
            }

            return $user;
        });

        event(new Registered($user));

        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }
}
