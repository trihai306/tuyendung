<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateCandidateProfileRequest;
use App\Models\CandidateProfile;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CandidateProfileController extends Controller
{
    /**
     * Candidate: show edit form for their profile.
     */
    public function edit(): Response
    {
        $user = auth()->user();
        abort_unless($user->isCandidate(), 403, 'Only candidates can edit their candidate profile.');

        $profile = $user->candidateProfile ?? CandidateProfile::create([
            'user_id' => $user->id,
        ]);

        return Inertia::render('Candidate/Profile/Edit', [
            'profile' => $profile,
        ]);
    }

    /**
     * Candidate: update their profile.
     */
    public function update(UpdateCandidateProfileRequest $request): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user->isCandidate(), 403, 'Only candidates can update their candidate profile.');

        $profile = $user->candidateProfile ?? CandidateProfile::create([
            'user_id' => $user->id,
        ]);

        $profile->update($request->validated());

        return redirect()->back()
            ->with('success', 'Candidate profile updated successfully.');
    }
}
