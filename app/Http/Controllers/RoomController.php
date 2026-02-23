<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRoomRequest;
use App\Http\Requests\UpdateRoomRequest;
use App\Models\Room;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class RoomController extends Controller
{
    /**
     * Public listing with filters and pagination.
     */
    public function index(Request $request): Response
    {
        $query = Room::available()->with('landlord');

        // Search filter
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%");
            });
        }

        // City filter
        if ($city = $request->input('city')) {
            $query->inCity($city);
        }

        // Room type filter
        if ($roomType = $request->input('room_type')) {
            $query->where('room_type', $roomType);
        }

        // Price range filter
        if ($request->filled('price_min') && $request->filled('price_max')) {
            $query->priceRange($request->input('price_min'), $request->input('price_max'));
        } elseif ($priceMin = $request->input('price_min')) {
            $query->where('price', '>=', $priceMin);
        } elseif ($priceMax = $request->input('price_max')) {
            $query->where('price', '<=', $priceMax);
        }

        // District filter
        if ($district = $request->input('district')) {
            $query->where('district', $district);
        }

        $rooms = $query->latest()->paginate(12)->withQueryString();

        return Inertia::render('Rooms/Index', [
            'rooms' => $rooms,
            'filters' => $request->only(['search', 'city', 'room_type', 'price_min', 'price_max', 'district']),
        ]);
    }

    /**
     * Public detail page.
     */
    public function show(Room $room): Response
    {
        $room->load(['landlord', 'reviews.user']);

        // Increment views
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

        $validated = $request->validated();
        $validated['landlord_id'] = $user->id;
        $validated['slug'] = Str::slug($validated['title']) . '-' . Str::random(6);

        Room::create($validated);

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

        $room->update($request->validated());

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

        $room->delete();

        return redirect()->route('dashboard')
            ->with('success', 'Xoa phong tro thanh cong.');
    }
}
