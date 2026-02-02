<?php

namespace App\Filament\Resources;

use App\Filament\Resources\PlatformAccountResource\Pages;
use App\Models\PlatformAccount;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Notifications\Notification;

class PlatformAccountResource extends Resource
{
    protected static ?string $model = PlatformAccount::class;

    protected static ?string $navigationIcon = 'heroicon-o-globe-alt';

    protected static ?string $navigationGroup = 'Marketing';

    protected static ?string $modelLabel = 'Tài khoản MXH';

    protected static ?string $pluralModelLabel = 'Tài khoản MXH';

    protected static ?int $navigationSort = 3;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Thông tin tài khoản')
                    ->columns(2)
                    ->schema([
                        Forms\Components\TextInput::make('name')
                            ->label('Tên hiển thị')
                            ->required()
                            ->maxLength(255),
                        Forms\Components\Select::make('platform')
                            ->label('Nền tảng')
                            ->options([
                                'facebook' => 'Facebook',
                                'zalo' => 'Zalo',
                            ])
                            ->required()
                            ->reactive(),
                        Forms\Components\Select::make('company_id')
                            ->label('Công ty')
                            ->relationship('company', 'name')
                            ->searchable()
                            ->preload()
                            ->nullable(),
                        Forms\Components\TextInput::make('account_id')
                            ->label('ID tài khoản')
                            ->maxLength(255),
                    ]),

                Forms\Components\Section::make('Xác thực Zalo')
                    ->visible(fn(Forms\Get $get) => $get('platform') === 'zalo')
                    ->schema([
                        Forms\Components\TextInput::make('access_token')
                            ->label('Access Token')
                            ->password()
                            ->revealable()
                            ->helperText('Lấy từ Zalo Developer Console'),
                        Forms\Components\TextInput::make('refresh_token')
                            ->label('Refresh Token')
                            ->password()
                            ->revealable(),
                        Forms\Components\DateTimePicker::make('token_expires_at')
                            ->label('Token hết hạn'),
                    ]),

                Forms\Components\Section::make('Xác thực Facebook')
                    ->visible(fn(Forms\Get $get) => $get('platform') === 'facebook')
                    ->schema([
                        Forms\Components\Textarea::make('credentials.cookies')
                            ->label('Cookies JSON')
                            ->rows(5)
                            ->helperText('Paste cookies từ browser (JSON format)'),
                        Forms\Components\TextInput::make('credentials.page_url')
                            ->label('URL Fanpage')
                            ->url()
                            ->placeholder('https://facebook.com/yourpage'),
                        Forms\Components\TextInput::make('credentials.group_url')
                            ->label('URL Group')
                            ->url()
                            ->placeholder('https://facebook.com/groups/yourgroup'),
                    ]),

                Forms\Components\Section::make('Cài đặt')
                    ->columns(2)
                    ->schema([
                        Forms\Components\Toggle::make('is_active')
                            ->label('Kích hoạt')
                            ->default(true),
                        Forms\Components\Toggle::make('is_default')
                            ->label('Mặc định'),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->label('Tên')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\BadgeColumn::make('platform')
                    ->label('Nền tảng')
                    ->formatStateUsing(fn(string $state): string => match ($state) {
                        'facebook' => 'Facebook',
                        'zalo' => 'Zalo',
                        default => $state,
                    })
                    ->colors([
                        'primary' => 'facebook',
                        'success' => 'zalo',
                    ]),
                Tables\Columns\TextColumn::make('company.name')
                    ->label('Công ty')
                    ->placeholder('Chung'),
                Tables\Columns\IconColumn::make('is_active')
                    ->label('Hoạt động')
                    ->boolean(),
                Tables\Columns\TextColumn::make('token_expires_at')
                    ->label('Token hết hạn')
                    ->dateTime('d/m/Y')
                    ->placeholder('-')
                    ->color(fn($state) => $state && $state < now() ? 'danger' : null),
                Tables\Columns\TextColumn::make('scheduled_posts_count')
                    ->label('Bài đăng')
                    ->counts('scheduledPosts'),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('platform')
                    ->label('Nền tảng')
                    ->options([
                        'facebook' => 'Facebook',
                        'zalo' => 'Zalo',
                    ]),
                Tables\Filters\TernaryFilter::make('is_active')
                    ->label('Hoạt động'),
            ])
            ->actions([
                Tables\Actions\Action::make('validate')
                    ->label('Kiểm tra')
                    ->icon('heroicon-o-shield-check')
                    ->action(function ($record) {
                        $service = $record->platform === 'zalo'
                            ? app(\App\Services\SocialMedia\ZaloPosterService::class)
                            : app(\App\Services\SocialMedia\FacebookPosterService::class);

                        $valid = $service->validateAccount($record);

                        Notification::make()
                            ->title($valid ? 'Tài khoản hợp lệ' : 'Tài khoản không hợp lệ')
                            ->icon($valid ? 'heroicon-o-check-circle' : 'heroicon-o-x-circle')
                            ->color($valid ? 'success' : 'danger')
                            ->send();
                    }),
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListPlatformAccounts::route('/'),
            'create' => Pages\CreatePlatformAccount::route('/create'),
            'edit' => Pages\EditPlatformAccount::route('/{record}/edit'),
        ];
    }
}

