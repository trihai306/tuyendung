<?php

namespace App\Filament\Resources\ScheduledPostResource\Pages;

use App\Filament\Resources\ScheduledPostResource;
use Filament\Resources\Pages\EditRecord;
use Filament\Actions;

class EditScheduledPost extends EditRecord
{
    protected static string $resource = ScheduledPostResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
