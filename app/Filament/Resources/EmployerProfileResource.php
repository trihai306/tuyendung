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

    protected static ?string $navigationGroup = 'Người dùng';

    protected static ?string $navigationLabel = 'Nhà tuyển dụng';

    protected static ?string $modelLabel = 'Nhà tuyển dụng';

    protected static ?string $pluralModelLabel = 'Nhà tuyển dụng';

    protected static ?int $navigationSort = 3;

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
                            ->label('Tên công ty')
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
                            ->label('Quy mô')
                            ->maxLength(50),
                        Forms\Components\TextInput::make('tax_code')
                            ->label('Ma so thue')
                            ->maxLength(50),
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
                        Forms\Components\TextInput::make('address')
                            ->label('Địa chỉ'),
                        Forms\Components\TextInput::make('district')
                            ->label('Quận/Huyện'),
                        Forms\Components\TextInput::make('city')
                            ->label('Thành phố'),
                        Forms\Components\Textarea::make('description')
                            ->label('Gioi thieu cong ty')
                            ->columnSpanFull(),
                    ])
                    ->columns(2),
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
                    ->label('Thành phố')
                    ->searchable(),
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
