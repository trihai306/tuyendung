<?php

declare(strict_types=1);

namespace App\Filament\Resources\CandidateProfileResource\Pages;

use App\Filament\Resources\CandidateProfileResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditCandidateProfile extends EditRecord
{
    protected static string $resource = CandidateProfileResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
