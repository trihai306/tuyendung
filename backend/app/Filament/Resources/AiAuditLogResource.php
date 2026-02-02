<?php

namespace App\Filament\Resources;

use App\Filament\Resources\AiAuditLogResource\Pages;
use App\Models\AiAuditLog;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Infolists;
use Filament\Infolists\Infolist;

class AiAuditLogResource extends Resource
{
    protected static ?string $model = AiAuditLog::class;

    protected static ?string $navigationIcon = 'heroicon-o-document-magnifying-glass';

    protected static ?string $navigationGroup = 'AI';

    protected static ?string $modelLabel = 'Log AI';

    protected static ?string $pluralModelLabel = 'Logs AI';

    protected static ?int $navigationSort = 2;

    public static function canCreate(): bool
    {
        return false;
    }

    public static function canEdit($record): bool
    {
        return false;
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('session.conversation.participant_name')
                    ->label('Hội thoại')
                    ->searchable(),
                Tables\Columns\TextColumn::make('action_type')
                    ->label('Loại hành động')
                    ->badge(),
                Tables\Columns\TextColumn::make('tool_name')
                    ->label('Tool')
                    ->searchable(),
                Tables\Columns\TextColumn::make('confidence_score')
                    ->label('Độ tin cậy')
                    ->formatStateUsing(fn($state) => $state ? "{$state}%" : '-'),
                Tables\Columns\TextColumn::make('processing_time_ms')
                    ->label('Thời gian (ms)')
                    ->numeric(),
                Tables\Columns\TextColumn::make('approvedByUser.name')
                    ->label('Duyệt bởi'),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Thời gian')
                    ->dateTime('d/m/Y H:i:s')
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('action_type')
                    ->label('Loại hành động')
                    ->options([
                        'generate_response' => 'Tạo phản hồi',
                        'tool_call' => 'Gọi tool',
                        'classification' => 'Phân loại',
                    ]),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
            ])
            ->bulkActions([]);
    }

    public static function infolist(Infolist $infolist): Infolist
    {
        return $infolist
            ->schema([
                Infolists\Components\Section::make('Thông tin chung')
                    ->columns(3)
                    ->schema([
                        Infolists\Components\TextEntry::make('session.conversation.participant_name')
                            ->label('Hội thoại'),
                        Infolists\Components\TextEntry::make('action_type')
                            ->label('Loại hành động')
                            ->badge(),
                        Infolists\Components\TextEntry::make('tool_name')
                            ->label('Tool'),
                        Infolists\Components\TextEntry::make('confidence_score')
                            ->label('Độ tin cậy'),
                        Infolists\Components\TextEntry::make('processing_time_ms')
                            ->label('Thời gian xử lý (ms)'),
                        Infolists\Components\TextEntry::make('created_at')
                            ->label('Thời gian')
                            ->dateTime(),
                    ]),
                Infolists\Components\Section::make('Nội dung')
                    ->schema([
                        Infolists\Components\TextEntry::make('input_prompt')
                            ->label('Input Prompt')
                            ->columnSpanFull(),
                        Infolists\Components\TextEntry::make('generated_response')
                            ->label('Phản hồi AI')
                            ->columnSpanFull(),
                        Infolists\Components\TextEntry::make('final_response')
                            ->label('Phản hồi cuối cùng')
                            ->columnSpanFull(),
                    ]),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListAiAuditLogs::route('/'),
            'view' => Pages\ViewAiAuditLog::route('/{record}'),
        ];
    }
}
