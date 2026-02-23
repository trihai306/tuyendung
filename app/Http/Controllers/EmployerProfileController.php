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

        $validated = $request->validated();

        // Handle logo file upload
        if ($request->hasFile('company_logo')) {
            $path = $request->file('company_logo')->store('company-logos', 'public');
            $validated['company_logo'] = '/storage/' . $path;
        } else {
            unset($validated['company_logo']);
        }

        $profile->update($validated);

        return redirect()->back()
            ->with('success', 'Cập nhật hồ sơ công ty thành công.');
    }
}
