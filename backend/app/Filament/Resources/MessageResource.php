<?php

namespace App\Filament\Resources;

use App\Filament\Resources\MessageResource\Pages;
use App\Models\Message;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class MessageResource extends Resource
{
    protected static ?string $model = Message::class;

    protected static ?string $navigationIcon = 'heroicon-o-envelope';

    protected static ?string $navigationGroup = 'Kênh truyền thông';

    protected static ?string $modelLabel = 'Tin nhắn';

    protected static ?string $pluralModelLabel = 'Tin nhắn';

    protected static ?int $navigationSort = 4;

    public static function canCreate(): bool
    {
        return false;
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('conversation.participant_name')
                    ->label('Hội thoại')
                    ->searchable(),
                Tables\Columns\BadgeColumn::make('direction')
                    ->label('Chiều')
                    ->colors([
                        'success' => 'inbound',
                        'primary' => 'outbound',
                    ])
                    ->formatStateUsing(fn($state) => $state === 'inbound' ? 'Nhận' : 'Gửi'),
                Tables\Columns\TextColumn::make('sender_name')
                    ->label('Người gửi')
                    ->searchable(),
                Tables\Columns\TextColumn::make('content')
                    ->label('Nội dung')
                    ->limit(50)
                    ->searchable(),
                Tables\Columns\BadgeColumn::make('content_type')
                    ->label('Loại')
                    ->colors([
                        'gray' => 'text',
                        'info' => 'image',
                        'warning' => 'file',
                    ]),
                Tables\Columns\IconColumn::make('ai_generated')
                    ->label('AI')
                    ->boolean()
                    ->trueIcon('heroicon-o-sparkles')
                    ->trueColor('warning'),
                Tables\Columns\BadgeColumn::make('status')
                    ->label('Trạng thái')
                    ->colors([
                        'warning' => 'pending',
                        'success' => 'sent',
                        'primary' => 'delivered',
                        'info' => 'read',
                        'danger' => 'failed',
                    ]),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Thời gian')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('direction')
                    ->label('Chiều')
                    ->options([
                        'inbound' => 'Nhận vào',
                        'outbound' => 'Gửi đi',
                    ]),
                Tables\Filters\TernaryFilter::make('ai_generated')
                    ->label('Tin AI'),
                Tables\Filters\SelectFilter::make('status')
                    ->label('Trạng thái')
                    ->options([
                        'pending' => 'Đang chờ',
                        'sent' => 'Đã gửi',
                        'delivered' => 'Đã nhận',
                        'read' => 'Đã đọc',
                        'failed' => 'Thất bại',
                    ]),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
            ])
            ->bulkActions([]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListMessages::route('/'),
        ];
    }
}
