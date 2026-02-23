<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateEmployerProfileRequest;
use App\Models\EmployerProfile;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class EmployerProfileController extends Controller
{
    /**
     * Employer: show edit form for their profile.
     */
    public function edit(): Response
    {
        $user = auth()->user();
        abort_unless($user->isEmployer(), 403, 'Only employers can edit their employer profile.');

        $profile = $user->employerProfile ?? EmployerProfile::create([
            'user_id' => $user->id,
        ]);

        return Inertia::render('Employer/Profile/Edit', [
            'profile' => $profile,
        ]);
    }

    /**
     * Employer: update their profile.
     */
    public function update(UpdateEmployerProfileRequest $request): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user->isEmployer(), 403, 'Only employers can update their employer profile.');

        $profile = $user->employerProfile ?? EmployerProfile::create([
            'user_id' => $user->id,
        ]);

        $profile->update($request->validated());

        return redirect()->back()
            ->with('success', 'Employer profile updated successfully.');
    }
}
