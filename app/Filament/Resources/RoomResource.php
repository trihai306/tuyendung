<?php

declare(strict_types=1);

namespace App\Filament\Resources;

use App\Filament\Resources\RoomResource\Pages;
use App\Models\Room;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class RoomResource extends Resource
{
    protected static ?string $model = Room::class;

    protected static ?string $navigationIcon = 'heroicon-o-home';

    protected static ?string $navigationGroup = 'Phong tro';

    protected static ?string $navigationLabel = 'Phong tro';

    protected static ?string $modelLabel = 'Phong tro';

    protected static ?string $pluralModelLabel = 'Phong tro';

    protected static ?int $navigationSort = 1;

    public static function getNavigationBadge(): ?string
    {
        return (string) static::getModel()::where('status', 'available')->count();
    }

    public static function getNavigationBadgeColor(): string|array|null
    {
        return 'success';
    }

    public static function getGloballySearchableAttributes(): array
    {
        return ['title', 'city', 'landlord.name'];
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Thong tin co ban')
                    ->schema([
                        Forms\Components\TextInput::make('title')
                            ->label('Tieu de')
                            ->required()
                            ->maxLength(255),
                        Forms\Components\TextInput::make('slug')
                            ->label('Slug')
                            ->required()
                            ->maxLength(255)
                            ->unique(ignoreRecord: true),
                        Forms\Components\Select::make('landlord_id')
                            ->label('Chu tro')
                            ->relationship('landlord', 'name')
                            ->searchable()
                            ->preload()
                            ->required(),
                        Forms\Components\Select::make('room_type')
                            ->label('Loai phong')
                            ->options([
                                'single' => 'Phong don',
                                'shared' => 'Phong ghep',
                                'apartment' => 'Can ho',
                                'house' => 'Nha nguyen can',
                            ])
                            ->required(),
                        Forms\Components\Select::make('status')
                            ->label('Trang thai')
                            ->options([
                                'available' => 'Con trong',
                                'occupied' => 'Da cho thue',
                                'maintenance' => 'Dang bao tri',
                            ])
                            ->default('available')
                            ->required(),
                        Forms\Components\TextInput::make('max_tenants')
                            ->label('So nguoi toi da')
                            ->numeric()
                            ->default(1),
                    ])
                    ->columns(2),

                Forms\Components\Section::make('Gia ca')
                    ->schema([
                        Forms\Components\TextInput::make('price')
                            ->label('Gia thue/thang')
                            ->numeric()
                            ->prefix('VND')
                            ->required(),
                        Forms\Components\TextInput::make('electricity_price')
                            ->label('Gia dien/kWh')
                            ->numeric()
                            ->prefix('VND'),
                        Forms\Components\TextInput::make('water_price')
                            ->label('Gia nuoc/m3')
                            ->numeric()
                            ->prefix('VND'),
                    ])
                    ->columns(3),

                Forms\Components\Section::make('Vi tri')
                    ->schema([
                        Forms\Components\TextInput::make('address')
                            ->label('Dia chi')
                            ->maxLength(255),
                        Forms\Components\TextInput::make('district')
                            ->label('Quan/Huyen')
                            ->maxLength(100),
                        Forms\Components\TextInput::make('city')
                            ->label('Thanh pho')
                            ->maxLength(100),
                        Forms\Components\TextInput::make('area_sqm')
                            ->label('Dien tich (m2)')
                            ->numeric(),
                    ])
                    ->columns(2),

                Forms\Components\Section::make('Chi tiet')
                    ->schema([
                        Forms\Components\RichEditor::make('description')
                            ->label('Mo ta')
                            ->columnSpanFull(),
                        Forms\Components\TagsInput::make('amenities')
                            ->label('Tien ich')
                            ->columnSpanFull(),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('title')
                    ->label('Tieu de')
                    ->searchable()
                    ->sortable()
                    ->limit(40),
                Tables\Columns\TextColumn::make('landlord.name')
                    ->label('Chu tro')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('room_type')
                    ->label('Loai')
                    ->badge()
                    ->formatStateUsing(fn(string $state): string => match ($state) {
                        'single' => 'Phong don',
                        'shared' => 'Phong ghep',
                        'apartment' => 'Can ho',
                        'house' => 'Nguyen can',
                        default => $state,
                    }),
                Tables\Columns\TextColumn::make('price')
                    ->label('Gia')
                    ->numeric()
                    ->sortable()
                    ->suffix(' VND'),
                Tables\Columns\TextColumn::make('area_sqm')
                    ->label('Dien tich')
                    ->suffix(' m2')
                    ->sortable(),
                Tables\Columns\TextColumn::make('status')
                    ->label('Trang thai')
                    ->badge()
                    ->color(fn(string $state): string => match ($state) {
                        'available' => 'success',
                        'occupied' => 'warning',
                        'maintenance' => 'danger',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn(string $state): string => match ($state) {
                        'available' => 'Con trong',
                        'occupied' => 'Da thue',
                        'maintenance' => 'Bao tri',
                        default => $state,
                    }),
                Tables\Columns\TextColumn::make('city')
                    ->label('Thanh pho')
                    ->searchable(),
                Tables\Columns\TextColumn::make('views_count')
                    ->label('Luot xem')
                    ->numeric()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->label('Trang thai')
                    ->options([
                        'available' => 'Con trong',
                        'occupied' => 'Da cho thue',
                        'maintenance' => 'Bao tri',
                    ]),
                Tables\Filters\SelectFilter::make('room_type')
                    ->label('Loai phong')
                    ->options([
                        'single' => 'Phong don',
                        'shared' => 'Phong ghep',
                        'apartment' => 'Can ho',
                        'house' => 'Nha nguyen can',
                    ]),
            ])
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
            'index' => Pages\ListRooms::route('/'),
            'create' => Pages\CreateRoom::route('/create'),
            'edit' => Pages\EditRoom::route('/{record}/edit'),
        ];
    }
}
