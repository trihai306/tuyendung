<?php

declare(strict_types=1);

namespace App\Filament\Resources\RecruitmentTaskResource\Pages;

use App\Filament\Resources\RecruitmentTaskResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListRecruitmentTasks extends ListRecords
{
    protected static string $resource = RecruitmentTaskResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
