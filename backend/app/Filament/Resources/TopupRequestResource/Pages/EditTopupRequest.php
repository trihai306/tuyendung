<?php

namespace App\Filament\Resources\TopupRequestResource\Pages;

use App\Filament\Resources\TopupRequestResource;
use Filament\Resources\Pages\EditRecord;
use Filament\Actions;

class EditTopupRequest extends EditRecord
{
    protected static string $resource = TopupRequestResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
