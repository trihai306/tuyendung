<?php

declare(strict_types=1);

namespace App\Filament\Resources\TenantContractResource\Pages;

use App\Filament\Resources\TenantContractResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListTenantContracts extends ListRecords
{
    protected static string $resource = TenantContractResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
