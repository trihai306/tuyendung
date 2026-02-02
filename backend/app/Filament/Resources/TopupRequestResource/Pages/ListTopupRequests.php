<?php

namespace App\Filament\Resources\TopupRequestResource\Pages;

use App\Filament\Resources\TopupRequestResource;
use Filament\Resources\Pages\ListRecords;
use Filament\Actions;

class ListTopupRequests extends ListRecords
{
    protected static string $resource = TopupRequestResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
