<?php

declare(strict_types=1);

namespace App\Filament\Resources;

use App\Filament\Resources\EmployerProfileResource\Pages;
use App\Models\EmployerProfile;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class EmployerProfileResource extends Resource
{
    protected static ?string $model = EmployerProfile::class;

    protected static ?string $navigationIcon = 'heroicon-o-building-office';

    protected static ?string $navigationGroup = 'Nguoi dung';

    protected static ?string $navigationLabel = 'Nha tuyen dung';

    protected static ?string $modelLabel = 'Nha tuyen dung';

    protected static ?string $pluralModelLabel = 'Nha tuyen dung';

    protected static ?int $navigationSort = 3;

    public static function getNavigationBadge(): ?string
    {
        return (string) static::getModel()::count();
    }

    public static function getGloballySearchableAttributes(): array
    {
        return ['company_name', 'city', 'user.name'];
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Thong tin cong ty')
                    ->schema([
                        Forms\Components\Select::make('user_id')
                            ->label('Tai khoan')
                            ->relationship('user', 'name')
                            ->searchable()
                            ->preload()
                            ->required(),
                        Forms\Components\TextInput::make('company_name')
                            ->label('Ten cong ty')
                            ->required()
                            ->maxLength(255),
                        Forms\Components\FileUpload::make('company_logo')
                            ->label('Logo')
                            ->image()
                            ->directory('company-logos'),
                        Forms\Components\TextInput::make('industry')
                            ->label('Nganh nghe')
                            ->maxLength(255),
                        Forms\Components\TextInput::make('company_size')
                            ->label('Quy mo')
                            ->maxLength(50),
                        Forms\Components\TextInput::make('tax_code')
                            ->label('Ma so thue')
                            ->maxLength(50),
                    ])
                    ->columns(2),

                Forms\Components\Section::make('Lien he')
                    ->schema([
                        Forms\Components\TextInput::make('website')
                            ->label('Website')
                            ->url()
                            ->maxLength(255),
                        Forms\Components\TextInput::make('contact_phone')
                            ->label('SDT lien he')
                            ->tel()
                            ->maxLength(20),
                        Forms\Components\TextInput::make('contact_email')
                            ->label('Email lien he')
                            ->email()
                            ->maxLength(255),
                    ])
                    ->columns(3),

                Forms\Components\Section::make('Dia chi')
                    ->schema([
                        Forms\Components\TextInput::make('address')
                            ->label('Dia chi'),
                        Forms\Components\TextInput::make('district')
                            ->label('Quan/Huyen'),
                        Forms\Components\TextInput::make('city')
                            ->label('Thanh pho'),
                    ])
                    ->columns(3),

                Forms\Components\Section::make('Gioi thieu')
                    ->schema([
                        Forms\Components\Textarea::make('description')
                            ->label('Gioi thieu cong ty')
                            ->columnSpanFull(),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\ImageColumn::make('company_logo')
                    ->label('Logo')
                    ->circular(),
                Tables\Columns\TextColumn::make('company_name')
                    ->label('Cong ty')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('user.name')
                    ->label('Tai khoan')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('industry')
                    ->label('Nganh nghe')
                    ->searchable(),
                Tables\Columns\TextColumn::make('city')
                    ->label('Thanh pho')
                    ->searchable(),
                Tables\Columns\TextColumn::make('invite_code')
                    ->label('Ma moi')
                    ->badge()
                    ->color('info')
                    ->toggleable(),
                Tables\Columns\TextColumn::make('contact_phone')
                    ->label('SDT')
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([])
            ->actions([
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
            'index' => Pages\ListEmployerProfiles::route('/'),
            'create' => Pages\CreateEmployerProfile::route('/create'),
            'edit' => Pages\EditEmployerProfile::route('/{record}/edit'),
        ];
    }
}
