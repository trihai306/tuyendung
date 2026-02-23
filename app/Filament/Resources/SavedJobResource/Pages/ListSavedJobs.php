<?php

declare(strict_types=1);

namespace App\Filament\Resources\SavedJobResource\Pages;

use App\Filament\Resources\SavedJobResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListSavedJobs extends ListRecords
{
    protected static string $resource = SavedJobResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
