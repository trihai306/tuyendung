<?php

declare(strict_types=1);

namespace App\Filament\Resources\UtilityBillResource\Pages;

use App\Filament\Resources\UtilityBillResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditUtilityBill extends EditRecord
{
    protected static string $resource = UtilityBillResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
