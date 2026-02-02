<?php

namespace App\Filament\Resources\AiSessionResource\Pages;

use App\Filament\Resources\AiSessionResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListAiSessions extends ListRecords
{
    protected static string $resource = AiSessionResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
