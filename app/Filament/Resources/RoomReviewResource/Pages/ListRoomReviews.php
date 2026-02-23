<?php

declare(strict_types=1);

namespace App\Filament\Resources\RoomReviewResource\Pages;

use App\Filament\Resources\RoomReviewResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListRoomReviews extends ListRecords
{
    protected static string $resource = RoomReviewResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
