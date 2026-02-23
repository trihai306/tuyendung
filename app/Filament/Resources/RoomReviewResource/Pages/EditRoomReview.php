<?php

declare(strict_types=1);

namespace App\Filament\Resources\RoomReviewResource\Pages;

use App\Filament\Resources\RoomReviewResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditRoomReview extends EditRecord
{
    protected static string $resource = RoomReviewResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
