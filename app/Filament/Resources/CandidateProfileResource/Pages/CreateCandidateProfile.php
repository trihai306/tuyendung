<?php

declare(strict_types=1);

namespace App\Filament\Resources\CandidateProfileResource\Pages;

use App\Filament\Resources\CandidateProfileResource;
use Filament\Resources\Pages\CreateRecord;

class CreateCandidateProfile extends CreateRecord
{
    protected static string $resource = CandidateProfileResource::class;
}
