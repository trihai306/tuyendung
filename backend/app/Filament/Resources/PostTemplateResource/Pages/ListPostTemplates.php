<?php

namespace App\Filament\Resources\PostTemplateResource\Pages;

use App\Filament\Resources\PostTemplateResource;
use Filament\Resources\Pages\ListRecords;
use Filament\Actions;

class ListPostTemplates extends ListRecords
{
    protected static string $resource = PostTemplateResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
