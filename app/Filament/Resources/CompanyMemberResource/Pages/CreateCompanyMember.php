<?php

declare(strict_types=1);

namespace App\Filament\Resources\CompanyMemberResource\Pages;

use App\Filament\Resources\CompanyMemberResource;
use Filament\Resources\Pages\CreateRecord;

class CreateCompanyMember extends CreateRecord
{
    protected static string $resource = CompanyMemberResource::class;
}
