<?php

declare(strict_types=1);

namespace App\Filament\Resources\CandidateProfileResource\Pages;

use App\Filament\Resources\CandidateProfileResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListCandidateProfiles extends ListRecords
{
    protected static string $resource = CandidateProfileResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
