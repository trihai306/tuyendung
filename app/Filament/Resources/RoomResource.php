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

    protected static ?string $navigationGroup = 'Phòng trọ';

    protected static ?string $navigationLabel = 'Phòng trọ';

    protected static ?string $modelLabel = 'Phòng trọ';

    protected static ?string $pluralModelLabel = 'Phòng trọ';

    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Thong tin co ban')
                    ->schema([
                        Forms\Components\TextInput::make('title')
                            ->label('Tiêu đề')
                            ->required()
                            ->maxLength(255),
                        Forms\Components\TextInput::make('slug')
                            ->label('Slug')
                            ->required()
                            ->maxLength(255)
                            ->unique(ignoreRecord: true),
                        Forms\Components\Select::make('landlord_id')
                            ->label('Chủ trọ')
                            ->relationship('landlord', 'name')
                            ->searchable()
                            ->preload()
                            ->required(),
                        Forms\Components\Select::make('room_type')
                            ->label('Loại phòng')
                            ->options([
                                'single' => 'Phong don',
                                'shared' => 'Phong ghep',
                                'apartment' => 'Can ho',
                                'house' => 'Nha nguyen can',
                            ])
                            ->required(),
                        Forms\Components\Select::make('status')
                            ->label('Trạng thái')
                            ->options([
                                'available' => 'Con trong',
                                'occupied' => 'Da cho thue',
                                'maintenance' => 'Dang bao tri',
                            ])
                            ->default('available')
                            ->required(),
                        Forms\Components\TextInput::make('max_tenants')
                            ->label('Số người tối đa')
                            ->numeric()
                            ->default(1),
                    ])
                    ->columns(2),

                Forms\Components\Section::make('Gia ca')
                    ->schema([
                        Forms\Components\TextInput::make('price')
                            ->label('Giá thuê/tháng')
                            ->numeric()
                            ->prefix('VND')
                            ->required(),
                        Forms\Components\TextInput::make('electricity_price')
                            ->label('Giá điện/kWh')
                            ->numeric()
                            ->prefix('VND'),
                        Forms\Components\TextInput::make('water_price')
                            ->label('Giá nước/m3')
                            ->numeric()
                            ->prefix('VND'),
                    ])
                    ->columns(3),

                Forms\Components\Section::make('Vi tri')
                    ->schema([
                        Forms\Components\TextInput::make('address')
                            ->label('Địa chỉ')
                            ->maxLength(255),
                        Forms\Components\TextInput::make('district')
                            ->label('Quận/Huyện')
                            ->maxLength(100),
                        Forms\Components\TextInput::make('city')
                            ->label('Thành phố')
                            ->maxLength(100),
                        Forms\Components\TextInput::make('area_sqm')
                            ->label('Diện tích (m2)')
                            ->numeric(),
                    ])
                    ->columns(2),

                Forms\Components\Section::make('Chi tiet')
                    ->schema([
                        Forms\Components\RichEditor::make('description')
                            ->label('Mô tả')
                            ->columnSpanFull(),
                        Forms\Components\TagsInput::make('amenities')
                            ->label('Tiện ích')
                            ->columnSpanFull(),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('title')
                    ->label('Tiêu đề')
                    ->searchable()
                    ->sortable()
                    ->limit(40),
                Tables\Columns\TextColumn::make('landlord.name')
                    ->label('Chủ trọ')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('room_type')
                    ->label('Loại')
                    ->badge(),
                Tables\Columns\TextColumn::make('price')
                    ->label('Giá')
                    ->numeric()
                    ->sortable()
                    ->suffix(' VND'),
                Tables\Columns\TextColumn::make('area_sqm')
                    ->label('Diện tích')
                    ->suffix(' m2')
                    ->sortable(),
                Tables\Columns\TextColumn::make('status')
                    ->label('Trạng thái')
                    ->badge()
                    ->color(fn(string $state): string => match ($state) {
                        'available' => 'success',
                        'occupied' => 'warning',
                        'maintenance' => 'danger',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('city')
                    ->label('Thành phố')
                    ->searchable(),
                Tables\Columns\TextColumn::make('views_count')
                    ->label('Lượt xem')
                    ->numeric()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'available' => 'Con trong',
                        'occupied' => 'Da cho thue',
                        'maintenance' => 'Bao tri',
                    ]),
                Tables\Filters\SelectFilter::make('room_type')
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
