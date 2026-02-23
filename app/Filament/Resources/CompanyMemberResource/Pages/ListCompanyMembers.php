<?php

declare(strict_types=1);

namespace App\Filament\Resources\CompanyMemberResource\Pages;

use App\Filament\Resources\CompanyMemberResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListCompanyMembers extends ListRecords
{
    protected static string $resource = CompanyMemberResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
