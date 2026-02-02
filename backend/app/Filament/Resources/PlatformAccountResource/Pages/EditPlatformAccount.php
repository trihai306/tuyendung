<?php

namespace App\Filament\Resources\PlatformAccountResource\Pages;

use App\Filament\Resources\PlatformAccountResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditPlatformAccount extends EditRecord
{
    protected static string $resource = PlatformAccountResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
