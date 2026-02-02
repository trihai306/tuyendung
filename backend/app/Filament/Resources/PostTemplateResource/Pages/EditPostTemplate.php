<?php

namespace App\Filament\Resources\PostTemplateResource\Pages;

use App\Filament\Resources\PostTemplateResource;
use Filament\Resources\Pages\EditRecord;
use Filament\Actions;

class EditPostTemplate extends EditRecord
{
    protected static string $resource = PostTemplateResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
