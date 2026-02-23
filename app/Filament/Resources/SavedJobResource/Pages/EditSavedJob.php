<?php

declare(strict_types=1);

namespace App\Filament\Resources\SavedJobResource\Pages;

use App\Filament\Resources\SavedJobResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditSavedJob extends EditRecord
{
    protected static string $resource = SavedJobResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
