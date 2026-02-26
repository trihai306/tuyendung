<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreRoomRequest;
use App\Http\Requests\UpdateRoomRequest;
use App\Models\Room;
use App\Services\RoomService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RoomController extends Controller
{
    public function __construct(
        private readonly RoomService $roomService,
    ) {
    }

    /**
     * Public listing with filters and pagination.
     */
    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'city', 'room_type', 'price_min', 'price_max', 'district']);
        $rooms = $this->roomService->getPublicListing($filters);

        return Inertia::render('Rooms/Index', [
            'rooms' => $rooms,
            'filters' => $filters,
        ]);
    }

    /**
     * Public detail page.
     */
    public function show(Room $room): Response
    {
        $room->load(['landlord', 'reviews.user']);
        $room->increment('views_count');

        return Inertia::render('Rooms/Show', [
            'room' => $room,
        ]);
    }

    /**
     * Landlord: show create form.
     */
    public function create(): Response
    {
        $user = auth()->user();
        abort_unless($user->isLandlord(), 403, 'Only landlords can create room listings.');

        return Inertia::render('Landlord/Rooms/Create');
    }

    /**
     * Landlord: store new room.
     */
    public function store(StoreRoomRequest $request): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user->isLandlord(), 403, 'Only landlords can create room listings.');

        $this->roomService->createRoom($user, $request->validated());

        return redirect()->route('dashboard')
            ->with('success', 'Tao phong tro thanh cong.');
    }

    /**
     * Landlord: show edit form.
     */
    public function edit(Room $room): Response
    {
        $user = auth()->user();
        abort_unless($user->isLandlord(), 403, 'Only landlords can edit room listings.');
        abort_if($room->landlord_id !== $user->id, 403, 'You can only edit your own room listings.');

        return Inertia::render('Landlord/Rooms/Edit', [
            'room' => $room,
        ]);
    }

    /**
     * Landlord: update room.
     */
    public function update(UpdateRoomRequest $request, Room $room): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user->isLandlord(), 403, 'Only landlords can update room listings.');
        abort_if($room->landlord_id !== $user->id, 403, 'You can only update your own room listings.');

        $this->roomService->updateRoom($room, $request->validated());

        return redirect()->back()
            ->with('success', 'Room listing updated successfully.');
    }

    /**
     * Landlord: soft delete room.
     */
    public function destroy(Room $room): RedirectResponse
    {
        $user = auth()->user();
        abort_unless($user->isLandlord(), 403, 'Only landlords can delete room listings.');
        abort_if($room->landlord_id !== $user->id, 403, 'You can only delete your own room listings.');

        $this->roomService->deleteRoom($room);

        return redirect()->route('dashboard')
            ->with('success', 'Xoa phong tro thanh cong.');
    }
}
