<?php

declare(strict_types=1);

namespace App\Filament\Resources\TenantContractResource\Pages;

use App\Filament\Resources\TenantContractResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditTenantContract extends EditRecord
{
    protected static string $resource = TenantContractResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
