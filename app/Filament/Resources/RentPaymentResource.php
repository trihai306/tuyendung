<?php

declare(strict_types=1);

namespace App\Filament\Resources;

use App\Filament\Resources\RentPaymentResource\Pages;
use App\Models\RentPayment;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class RentPaymentResource extends Resource
{
    protected static ?string $model = RentPayment::class;

    protected static ?string $navigationIcon = 'heroicon-o-banknotes';

    protected static ?string $navigationGroup = 'Phong tro';

    protected static ?string $navigationLabel = 'Thanh toan';

    protected static ?string $modelLabel = 'Thanh toan';

    protected static ?string $pluralModelLabel = 'Thanh toan';

    protected static ?int $navigationSort = 3;

    public static function getNavigationBadge(): ?string
    {
        return (string) static::getModel()::where('status', 'pending')->count();
    }

    public static function getNavigationBadgeColor(): string|array|null
    {
        $count = static::getModel()::where('status', 'pending')->count();
        return $count > 0 ? 'danger' : 'gray';
    }

    public static function getGloballySearchableAttributes(): array
    {
        return ['contract.id'];
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Thong tin thanh toan')
                    ->schema([
                        Forms\Components\Select::make('contract_id')
                            ->label('Hop dong')
                            ->relationship('contract', 'id')
                            ->searchable()
                            ->preload()
                            ->required(),
                        Forms\Components\TextInput::make('amount')
                            ->label('So tien')
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
                        Forms\Components\DateTimePicker::make('paid_at')
                            ->label('Ngay thanh toan'),
                        Forms\Components\Select::make('payment_method')
                            ->label('Phuong thuc')
                            ->options([
                                'cash' => 'Tien mat',
                                'transfer' => 'Chuyen khoan',
                                'momo' => 'MoMo',
                                'zalopay' => 'ZaloPay',
                            ]),
                        Forms\Components\Select::make('status')
                            ->label('Trang thai')
                            ->options([
                                'pending' => 'Chua thanh toan',
                                'paid' => 'Da thanh toan',
                                'overdue' => 'Qua han',
                            ])
                            ->default('pending')
                            ->required(),
                        Forms\Components\Textarea::make('notes')
                            ->label('Ghi chu')
                            ->columnSpanFull(),
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
                Tables\Columns\TextColumn::make('amount')
                    ->label('So tien')
                    ->numeric()
                    ->suffix(' VND')
                    ->sortable(),
                Tables\Columns\TextColumn::make('period_month')
                    ->label('Thang')
                    ->sortable(),
                Tables\Columns\TextColumn::make('period_year')
                    ->label('Nam')
                    ->sortable(),
                Tables\Columns\TextColumn::make('payment_method')
                    ->label('Phuong thuc')
                    ->badge()
                    ->formatStateUsing(fn(?string $state): string => match ($state) {
                        'cash' => 'Tien mat',
                        'transfer' => 'CK',
                        'momo' => 'MoMo',
                        'zalopay' => 'ZaloPay',
                        default => $state ?? '-',
                    }),
                Tables\Columns\TextColumn::make('status')
                    ->label('Trang thai')
                    ->badge()
                    ->color(fn(string $state): string => match ($state) {
                        'paid' => 'success',
                        'overdue' => 'danger',
                        default => 'warning',
                    })
                    ->formatStateUsing(fn(string $state): string => match ($state) {
                        'pending' => 'Chua TT',
                        'paid' => 'Da TT',
                        'overdue' => 'Qua han',
                        default => $state,
                    }),
                Tables\Columns\TextColumn::make('paid_at')
                    ->label('Ngay TT')
                    ->dateTime('d/m/Y')
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->label('Trang thai')
                    ->options([
                        'pending' => 'Chua thanh toan',
                        'paid' => 'Da thanh toan',
                        'overdue' => 'Qua han',
                    ]),
                Tables\Filters\SelectFilter::make('payment_method')
                    ->label('Phuong thuc')
                    ->options([
                        'cash' => 'Tien mat',
                        'transfer' => 'Chuyen khoan',
                        'momo' => 'MoMo',
                        'zalopay' => 'ZaloPay',
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
            'index' => Pages\ListRentPayments::route('/'),
            'create' => Pages\CreateRentPayment::route('/create'),
            'edit' => Pages\EditRentPayment::route('/{record}/edit'),
        ];
    }
}
