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

    protected static ?string $navigationGroup = 'Phòng trọ';

    protected static ?string $navigationLabel = 'Thanh toán';

    protected static ?string $modelLabel = 'Thanh toán';

    protected static ?string $pluralModelLabel = 'Thanh toán';

    protected static ?int $navigationSort = 3;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make()
                    ->schema([
                        Forms\Components\Select::make('contract_id')
                            ->label('Hợp đồng')
                            ->relationship('contract', 'id')
                            ->searchable()
                            ->preload()
                            ->required(),
                        Forms\Components\TextInput::make('amount')
                            ->label('Số tiền')
                            ->numeric()
                            ->prefix('VND')
                            ->required(),
                        Forms\Components\TextInput::make('period_month')
                            ->label('Tháng')
                            ->numeric()
                            ->required()
                            ->minValue(1)
                            ->maxValue(12),
                        Forms\Components\TextInput::make('period_year')
                            ->label('Năm')
                            ->numeric()
                            ->required(),
                        Forms\Components\DateTimePicker::make('paid_at')
                            ->label('Ngày thanh toán'),
                        Forms\Components\Select::make('payment_method')
                            ->label('Phương thức')
                            ->options([
                                'cash' => 'Tien mat',
                                'transfer' => 'Chuyen khoan',
                                'momo' => 'MoMo',
                                'zalopay' => 'ZaloPay',
                            ]),
                        Forms\Components\Select::make('status')
                            ->label('Trạng thái')
                            ->options([
                                'pending' => 'Chua thanh toan',
                                'paid' => 'Da thanh toan',
                                'overdue' => 'Qua han',
                            ])
                            ->default('pending')
                            ->required(),
                        Forms\Components\Textarea::make('notes')
                            ->label('Ghi chú')
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
                    ->label('Mã HĐ')
                    ->sortable(),
                Tables\Columns\TextColumn::make('amount')
                    ->label('Số tiền')
                    ->numeric()
                    ->suffix(' VND')
                    ->sortable(),
                Tables\Columns\TextColumn::make('period_month')
                    ->label('Tháng')
                    ->sortable(),
                Tables\Columns\TextColumn::make('period_year')
                    ->label('Năm')
                    ->sortable(),
                Tables\Columns\TextColumn::make('payment_method')
                    ->label('Phương thức')
                    ->badge(),
                Tables\Columns\TextColumn::make('status')
                    ->label('Trạng thái')
                    ->badge()
                    ->color(fn(string $state): string => match ($state) {
                        'paid' => 'success',
                        'overdue' => 'danger',
                        default => 'warning',
                    }),
                Tables\Columns\TextColumn::make('paid_at')
                    ->label('Ngày TT')
                    ->dateTime('d/m/Y')
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'pending' => 'Chua thanh toan',
                        'paid' => 'Da thanh toan',
                        'overdue' => 'Qua han',
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
