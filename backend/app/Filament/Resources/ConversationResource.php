<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ConversationResource\Pages;
use App\Models\Conversation;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Infolists;
use Filament\Infolists\Infolist;

class ConversationResource extends Resource
{
    protected static ?string $model = Conversation::class;

    protected static ?string $navigationIcon = 'heroicon-o-chat-bubble-bottom-center-text';

    protected static ?string $navigationGroup = 'Kênh truyền thông';

    protected static ?string $modelLabel = 'Hội thoại';

    protected static ?string $pluralModelLabel = 'Hội thoại';

    protected static ?int $navigationSort = 3;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make()
                    ->columns(2)
                    ->schema([
                        Forms\Components\Select::make('channel_id')
                            ->label('Kênh')
                            ->relationship('channel', 'channel_name')
                            ->disabled(),
                        Forms\Components\Select::make('candidate_id')
                            ->label('Ứng viên liên kết')
                            ->relationship('candidate', 'full_name')
                            ->searchable()
                            ->preload(),
                        Forms\Components\Select::make('status')
                            ->label('Trạng thái')
                            ->options([
                                'open' => 'Đang mở',
                                'pending' => 'Chờ xử lý',
                                'resolved' => 'Đã giải quyết',
                                'closed' => 'Đã đóng',
                            ]),
                        Forms\Components\Select::make('priority')
                            ->label('Ưu tiên')
                            ->options([
                                'low' => 'Thấp',
                                'normal' => 'Bình thường',
                                'high' => 'Cao',
                                'urgent' => 'Khẩn cấp',
                            ]),
                        Forms\Components\Select::make('assigned_to')
                            ->label('Phân công cho')
                            ->relationship('assignedUser', 'name')
                            ->searchable()
                            ->preload(),
                        Forms\Components\TagsInput::make('tags')
                            ->label('Nhãn'),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\ImageColumn::make('participant_avatar')
                    ->label('')
                    ->circular(),
                Tables\Columns\TextColumn::make('participant_name')
                    ->label('Người tham gia')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('channel.channel_name')
                    ->label('Kênh')
                    ->searchable(),
                Tables\Columns\BadgeColumn::make('status')
                    ->label('Trạng thái')
                    ->colors([
                        'success' => 'open',
                        'warning' => 'pending',
                        'primary' => 'resolved',
                        'secondary' => 'closed',
                    ]),
                Tables\Columns\BadgeColumn::make('priority')
                    ->label('Ưu tiên')
                    ->colors([
                        'gray' => 'low',
                        'info' => 'normal',
                        'warning' => 'high',
                        'danger' => 'urgent',
                    ]),
                Tables\Columns\TextColumn::make('unread_count')
                    ->label('Chưa đọc')
                    ->badge()
                    ->color('danger'),
                Tables\Columns\TextColumn::make('last_message_preview')
                    ->label('Tin nhắn cuối')
                    ->limit(40),
                Tables\Columns\TextColumn::make('last_message_at')
                    ->label('Thời gian')
                    ->dateTime('d/m H:i')
                    ->sortable(),
            ])
            ->defaultSort('last_message_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->label('Trạng thái')
                    ->options([
                        'open' => 'Đang mở',
                        'pending' => 'Chờ xử lý',
                        'resolved' => 'Đã giải quyết',
                        'closed' => 'Đã đóng',
                    ]),
                Tables\Filters\SelectFilter::make('priority')
                    ->label('Ưu tiên')
                    ->options([
                        'low' => 'Thấp',
                        'normal' => 'Bình thường',
                        'high' => 'Cao',
                        'urgent' => 'Khẩn cấp',
                    ]),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([]);
    }

    public static function infolist(Infolist $infolist): Infolist
    {
        return $infolist
            ->schema([
                Infolists\Components\Section::make('Thông tin hội thoại')
                    ->columns(2)
                    ->schema([
                        Infolists\Components\ImageEntry::make('participant_avatar')
                            ->label('Ảnh đại diện')
                            ->circular(),
                        Infolists\Components\TextEntry::make('participant_name')
                            ->label('Người tham gia'),
                        Infolists\Components\TextEntry::make('channel.channel_name')
                            ->label('Kênh'),
                        Infolists\Components\TextEntry::make('status')
                            ->label('Trạng thái')
                            ->badge(),
                        Infolists\Components\TextEntry::make('assignedUser.name')
                            ->label('Phân công'),
                        Infolists\Components\TextEntry::make('candidate.full_name')
                            ->label('Ứng viên'),
                    ]),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListConversations::route('/'),
            'view' => Pages\ViewConversation::route('/{record}'),
            'edit' => Pages\EditConversation::route('/{record}/edit'),
        ];
    }
}
