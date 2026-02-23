<?php

declare(strict_types=1);

namespace App\Filament\Resources\EmployerProfileResource\Pages;

use App\Filament\Resources\EmployerProfileResource;
use Filament\Resources\Pages\CreateRecord;

class CreateEmployerProfile extends CreateRecord
{
    protected static string $resource = EmployerProfileResource::class;
}
