<?php

declare(strict_types=1);

namespace App\Filament\Resources;

use App\Filament\Resources\UtilityBillResource\Pages;
use App\Models\UtilityBill;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class UtilityBillResource extends Resource
{
    protected static ?string $model = UtilityBill::class;

    protected static ?string $navigationIcon = 'heroicon-o-bolt';

    protected static ?string $navigationGroup = 'Phong tro';

    protected static ?string $navigationLabel = 'Hoa don dien nuoc';

    protected static ?string $modelLabel = 'Hoa don';

    protected static ?string $pluralModelLabel = 'Hoa don dien nuoc';

    protected static ?int $navigationSort = 4;

    public static function getGloballySearchableAttributes(): array
    {
        return ['contract.id'];
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Thong tin hoa don')
                    ->schema([
                        Forms\Components\Select::make('contract_id')
                            ->label('Hop dong')
                            ->relationship('contract', 'id')
                            ->searchable()
                            ->preload()
                            ->required(),
                        Forms\Components\Select::make('type')
                            ->label('Loai')
                            ->options([
                                'electricity' => 'Dien',
                                'water' => 'Nuoc',
                            ])
                            ->required(),
                        Forms\Components\TextInput::make('old_index')
                            ->label('Chi so cu')
                            ->numeric()
                            ->required(),
                        Forms\Components\TextInput::make('new_index')
                            ->label('Chi so moi')
                            ->numeric()
                            ->required(),
                        Forms\Components\TextInput::make('amount')
                            ->label('Thanh tien')
                            ->numeric()
                            ->prefix('VND')
                            ->required(),
                        Forms\Components\TextInput::make('period_month')
                            ->label('Thang')
                            ->numeric()
                            ->required()
                            ->minValue(1)
                            ->maxValue(12),
                        Forms\Components\TextInput::make('period_year')
                            ->label('Nam')
                            ->numeric()
                            ->required(),
                        Forms\Components\Select::make('status')
                            ->label('Trang thai')
                            ->options([
                                'pending' => 'Chua thanh toan',
                                'paid' => 'Da thanh toan',
                            ])
                            ->default('pending')
                            ->required(),
                    ])
                    ->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('contract.id')
                    ->label('Ma HD')
                    ->sortable(),
                Tables\Columns\TextColumn::make('type')
                    ->label('Loai')
                    ->badge()
                    ->color(fn(string $state): string => match ($state) {
                        'electricity' => 'warning',
                        'water' => 'info',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn(string $state): string => match ($state) {
                        'electricity' => 'Dien',
                        'water' => 'Nuoc',
                        default => $state,
                    }),
                Tables\Columns\TextColumn::make('old_index')
                    ->label('CS cu')
                    ->numeric(),
                Tables\Columns\TextColumn::make('new_index')
                    ->label('CS moi')
                    ->numeric(),
                Tables\Columns\TextColumn::make('amount')
                    ->label('Thanh tien')
                    ->numeric()
                    ->suffix(' VND')
                    ->sortable(),
                Tables\Columns\TextColumn::make('period_month')
                    ->label('Thang'),
                Tables\Columns\TextColumn::make('period_year')
                    ->label('Nam'),
                Tables\Columns\TextColumn::make('status')
                    ->label('Trang thai')
                    ->badge()
                    ->color(fn(string $state): string => match ($state) {
                        'paid' => 'success',
                        default => 'warning',
                    })
                    ->formatStateUsing(fn(string $state): string => match ($state) {
                        'pending' => 'Chua TT',
                        'paid' => 'Da TT',
                        default => $state,
                    }),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('type')
                    ->label('Loai')
                    ->options([
                        'electricity' => 'Dien',
                        'water' => 'Nuoc',
                    ]),
                Tables\Filters\SelectFilter::make('status')
                    ->label('Trang thai')
                    ->options([
                        'pending' => 'Chua thanh toan',
                        'paid' => 'Da thanh toan',
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
            'index' => Pages\ListUtilityBills::route('/'),
            'create' => Pages\CreateUtilityBill::route('/create'),
            'edit' => Pages\EditUtilityBill::route('/{record}/edit'),
        ];
    }
}
