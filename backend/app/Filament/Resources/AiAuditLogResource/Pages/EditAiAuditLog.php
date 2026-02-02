<?php

namespace App\Filament\Resources\AiAuditLogResource\Pages;

use App\Filament\Resources\AiAuditLogResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditAiAuditLog extends EditRecord
{
    protected static string $resource = AiAuditLogResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
