<?php

namespace App\Filament\Resources\PostTemplateResource\Pages;

use App\Filament\Resources\PostTemplateResource;
use Filament\Resources\Pages\CreateRecord;

class CreatePostTemplate extends CreateRecord
{
    protected static string $resource = PostTemplateResource::class;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        $data['user_id'] = auth()->id();
        return $data;
    }
}
