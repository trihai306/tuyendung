<?php

declare(strict_types=1);

namespace App\Filament\Resources\EmployerProfileResource\Pages;

use App\Filament\Resources\EmployerProfileResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListEmployerProfiles extends ListRecords
{
    protected static string $resource = EmployerProfileResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
