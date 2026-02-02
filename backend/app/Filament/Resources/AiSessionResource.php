<?php

namespace App\Filament\Resources;

use App\Filament\Resources\AiSessionResource\Pages;
use App\Models\AiSession;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class AiSessionResource extends Resource
{
    protected static ?string $model = AiSession::class;

    protected static ?string $navigationIcon = 'heroicon-o-cpu-chip';

    protected static ?string $navigationGroup = 'AI';

    protected static ?string $modelLabel = 'Phiên AI';

    protected static ?string $pluralModelLabel = 'Phiên AI';

    protected static ?int $navigationSort = 1;

    public static function canCreate(): bool
    {
        return false;
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make()
                    ->columns(2)
                    ->schema([
                        Forms\Components\Select::make('conversation_id')
                            ->label('Hội thoại')
                            ->relationship('conversation', 'participant_name')
                            ->disabled(),
                        Forms\Components\Select::make('job_id')
                            ->label('Tin tuyển dụng')
                            ->relationship('job', 'title')
                            ->disabled(),
                        Forms\Components\Select::make('mode')
                            ->label('Chế độ')
                            ->options([
                                'screening' => 'Sàng lọc',
                                'interview' => 'Phỏng vấn',
                                'support' => 'Hỗ trợ',
                            ])
                            ->disabled(),
                        Forms\Components\Select::make('status')
                            ->label('Trạng thái')
                            ->options([
                                'active' => 'Đang hoạt động',
                                'paused' => 'Tạm dừng',
                                'completed' => 'Hoàn thành',
                            ]),
                        Forms\Components\TextInput::make('current_step')
                            ->label('Bước hiện tại')
                            ->disabled(),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('conversation.participant_name')
                    ->label('Hội thoại')
                    ->searchable(),
                Tables\Columns\TextColumn::make('job.title')
                    ->label('Tin tuyển dụng')
                    ->limit(30),
                Tables\Columns\BadgeColumn::make('mode')
                    ->label('Chế độ')
                    ->colors([
                        'info' => 'screening',
                        'warning' => 'interview',
                        'primary' => 'support',
                    ]),
                Tables\Columns\BadgeColumn::make('status')
                    ->label('Trạng thái')
                    ->colors([
                        'success' => 'active',
                        'warning' => 'paused',
                        'secondary' => 'completed',
                    ]),
                Tables\Columns\TextColumn::make('current_step')
                    ->label('Bước'),
                Tables\Columns\TextColumn::make('audit_logs_count')
                    ->label('Logs')
                    ->counts('auditLogs'),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Bắt đầu')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->label('Trạng thái')
                    ->options([
                        'active' => 'Đang hoạt động',
                        'paused' => 'Tạm dừng',
                        'completed' => 'Hoàn thành',
                    ]),
                Tables\Filters\SelectFilter::make('mode')
                    ->label('Chế độ')
                    ->options([
                        'screening' => 'Sàng lọc',
                        'interview' => 'Phỏng vấn',
                        'support' => 'Hỗ trợ',
                    ]),
            ])
            ->actions([
                Tables\Actions\Action::make('pause')
                    ->label('Tạm dừng')
                    ->icon('heroicon-o-pause')
                    ->color('warning')
                    ->action(fn(AiSession $record) => $record->pause())
                    ->visible(fn(AiSession $record) => $record->status === 'active'),
                Tables\Actions\Action::make('complete')
                    ->label('Hoàn thành')
                    ->icon('heroicon-o-check')
                    ->color('success')
                    ->action(fn(AiSession $record) => $record->complete())
                    ->visible(fn(AiSession $record) => in_array($record->status, ['active', 'paused'])),
                Tables\Actions\ViewAction::make(),
            ])
            ->bulkActions([]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListAiSessions::route('/'),
            'view' => Pages\ViewAiSession::route('/{record}'),
        ];
    }
}
