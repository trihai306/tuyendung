<?php

declare(strict_types=1);

namespace App\Filament\Resources\UtilityBillResource\Pages;

use App\Filament\Resources\UtilityBillResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListUtilityBills extends ListRecords
{
    protected static string $resource = UtilityBillResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
