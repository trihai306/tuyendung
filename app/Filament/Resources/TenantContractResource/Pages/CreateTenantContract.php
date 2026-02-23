<?php

declare(strict_types=1);

namespace App\Filament\Resources\TenantContractResource\Pages;

use App\Filament\Resources\TenantContractResource;
use Filament\Resources\Pages\CreateRecord;

class CreateTenantContract extends CreateRecord
{
    protected static string $resource = TenantContractResource::class;
}
