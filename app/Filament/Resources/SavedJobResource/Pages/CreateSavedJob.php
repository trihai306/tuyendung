<?php

declare(strict_types=1);

namespace App\Filament\Resources\SavedJobResource\Pages;

use App\Filament\Resources\SavedJobResource;
use Filament\Resources\Pages\CreateRecord;

class CreateSavedJob extends CreateRecord
{
    protected static string $resource = SavedJobResource::class;
}
