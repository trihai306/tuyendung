<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Room;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;

class RoomService
{
    /**
     * Get public room listing with filters and pagination.
     */
    public function getPublicListing(array $filters): LengthAwarePaginator
    {
        $query = Room::available()->with('landlord');

        if ($search = $filters['search'] ?? null) {
            $query->where(function ($q) use ($search): void {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%");
            });
        }

        if ($city = $filters['city'] ?? null) {
            $query->inCity($city);
        }

        if ($roomType = $filters['room_type'] ?? null) {
            $query->where('room_type', $roomType);
        }

        if (isset($filters['price_min']) && isset($filters['price_max'])) {
            $query->priceRange($filters['price_min'], $filters['price_max']);
        } elseif ($priceMin = $filters['price_min'] ?? null) {
            $query->where('price', '>=', $priceMin);
        } elseif ($priceMax = $filters['price_max'] ?? null) {
            $query->where('price', '<=', $priceMax);
        }

        if ($district = $filters['district'] ?? null) {
            $query->where('district', $district);
        }

        return $query->latest()->paginate(12)->withQueryString();
    }

    /**
     * Create a new room listing.
     */
    public function createRoom(User $user, array $validated): Room
    {
        $validated['landlord_id'] = $user->id;
        $validated['slug'] = Str::slug($validated['title']) . '-' . Str::random(6);

        return Room::create($validated);
    }

    /**
     * Update a room listing.
     */
    public function updateRoom(Room $room, array $validated): Room
    {
        $room->update($validated);

        return $room;
    }

    /**
     * Delete a room listing (soft delete).
     */
    public function deleteRoom(Room $room): void
    {
        $room->delete();
    }
}
