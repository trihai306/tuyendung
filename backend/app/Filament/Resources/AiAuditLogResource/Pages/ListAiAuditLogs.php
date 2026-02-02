<?php

namespace App\Filament\Resources\AiAuditLogResource\Pages;

use App\Filament\Resources\AiAuditLogResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListAiAuditLogs extends ListRecords
{
    protected static string $resource = AiAuditLogResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
