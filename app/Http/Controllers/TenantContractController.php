<?php

namespace App\Http\Controllers;

use App\Models\TenantContract;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TenantContractController extends Controller
{
    /**
     * Landlord: list contracts.
     */
    public function index(): Response
    {
        $user = auth()->user();
        abort_unless($user->isLandlord(), 403, 'Only landlords can view contracts.');

        $roomIds = $user->rooms()->pluck('id');

        $contracts = TenantContract::whereIn('room_id', $roomIds)
            ->with(['room', 'tenant'])
            ->latest()
            ->paginate(10);

        return Inertia::render('Landlord/Contracts/Index', [
            'contracts' => $contracts,
        ]);
    }

    /**
     * Landlord: show create form.
     */
    public function create(): Response
    {
        $user = auth()->user();
        abort_unless($user->isLandlord(), 403, 'Only landlords can create contracts.');

        $rooms = $user->rooms()->available()->get();

        return Inertia::render('Landlord/Contracts/Create', [
            'rooms' => $rooms,
        ]);
    }

    /**
     * Landlord: store new contract.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user->isLandlord(), 403, 'Only landlords can create contracts.');

        $validated = $request->validate([
            'room_id' => ['required', 'exists:rooms,id'],
            'tenant_id' => ['required', 'exists:users,id'],
            'start_date' => ['required', 'date'],
            'end_date' => ['nullable', 'date', 'after:start_date'],
            'monthly_rent' => ['required', 'numeric', 'min:0'],
            'deposit' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        // Verify the landlord owns the room
        $room = $user->rooms()->find($validated['room_id']);
        abort_if(is_null($room), 403, 'You can only create contracts for your own rooms.');

        TenantContract::create($validated);

        return redirect()->route('landlord.contracts.index')
            ->with('success', 'Contract created successfully.');
    }

    /**
     * Landlord: view contract detail.
     */
    public function show(TenantContract $tenantContract): Response
    {
        $user = auth()->user();
        abort_unless($user->isLandlord(), 403, 'Only landlords can view contract details.');

        // Verify ownership through the room
        $room = $tenantContract->room;
        abort_if($room->landlord_id !== $user->id, 403, 'You can only view contracts for your own rooms.');

        $tenantContract->load(['room', 'tenant', 'payments']);

        return Inertia::render('Landlord/Contracts/Show', [
            'contract' => $tenantContract,
        ]);
    }

    /**
     * Landlord: update contract status.
     */
    public function update(Request $request, TenantContract $tenantContract): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user->isLandlord(), 403, 'Only landlords can update contracts.');

        // Verify ownership through the room
        $room = $tenantContract->room;
        abort_if($room->landlord_id !== $user->id, 403, 'You can only update contracts for your own rooms.');

        $validated = $request->validate([
            'status' => ['required', 'in:active,expired,terminated'],
            'end_date' => ['nullable', 'date'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $tenantContract->update($validated);

        return redirect()->back()
            ->with('success', 'Contract updated successfully.');
    }
}
