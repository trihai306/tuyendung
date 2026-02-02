<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ChannelResource\Pages;
use App\Models\Channel;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class ChannelResource extends Resource
{
    protected static ?string $model = Channel::class;

    protected static ?string $navigationIcon = 'heroicon-o-chat-bubble-left-right';

    protected static ?string $navigationGroup = 'Kênh truyền thông';

    protected static ?string $modelLabel = 'Kênh';

    protected static ?string $pluralModelLabel = 'Kênh';

    protected static ?int $navigationSort = 2;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make()
                    ->columns(2)
                    ->schema([
                        Forms\Components\Select::make('platform_account_id')
                            ->label('Tài khoản nền tảng')
                            ->relationship('platformAccount', 'account_name')
                            ->searchable()
                            ->preload()
                            ->required(),
                        Forms\Components\Select::make('channel_type')
                            ->label('Loại kênh')
                            ->options([
                                'page' => 'Fanpage',
                                'group' => 'Group',
                                'oa' => 'Official Account',
                            ])
                            ->required(),
                        Forms\Components\TextInput::make('channel_name')
                            ->label('Tên kênh')
                            ->required()
                            ->maxLength(255),
                        Forms\Components\TextInput::make('channel_id')
                            ->label('ID kênh')
                            ->maxLength(255),
                        Forms\Components\Toggle::make('is_active')
                            ->label('Đang hoạt động')
                            ->default(true),
                        Forms\Components\DateTimePicker::make('synced_at')
                            ->label('Đồng bộ lần cuối')
                            ->disabled(),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\ImageColumn::make('avatar_url')
                    ->label('')
                    ->circular(),
                Tables\Columns\TextColumn::make('channel_name')
                    ->label('Tên kênh')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('platformAccount.platform')
                    ->label('Nền tảng')
                    ->badge()
                    ->color(fn($state) => match ($state) {
                        'facebook' => 'primary',
                        'zalo' => 'success',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('channel_type')
                    ->label('Loại')
                    ->badge(),
                Tables\Columns\IconColumn::make('is_active')
                    ->label('Hoạt động')
                    ->boolean(),
                Tables\Columns\TextColumn::make('conversations_count')
                    ->label('Hội thoại')
                    ->counts('conversations'),
                Tables\Columns\TextColumn::make('synced_at')
                    ->label('Đồng bộ')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\TernaryFilter::make('is_active')
                    ->label('Trạng thái'),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListChannels::route('/'),
            'create' => Pages\CreateChannel::route('/create'),
            'edit' => Pages\EditChannel::route('/{record}/edit'),
        ];
    }
}
