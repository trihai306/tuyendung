<?php

namespace App\Filament\Resources;

use App\Filament\Resources\WalletTransactionResource\Pages;
use App\Models\WalletTransaction;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class WalletTransactionResource extends Resource
{
    protected static ?string $model = WalletTransaction::class;

    protected static ?string $navigationIcon = 'heroicon-o-receipt-percent';

    protected static ?string $navigationGroup = 'Hệ thống';

    protected static ?string $modelLabel = 'Lịch sử giao dịch';

    protected static ?string $pluralModelLabel = 'Lịch sử giao dịch';

    protected static ?int $navigationSort = 7;

    public static function canCreate(): bool
    {
        return false;
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')
                    ->label('ID')
                    ->sortable(),
                Tables\Columns\TextColumn::make('company.name')
                    ->label('Công ty')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('user.name')
                    ->label('Người thực hiện')
                    ->searchable(),
                Tables\Columns\BadgeColumn::make('type')
                    ->label('Loại')
                    ->formatStateUsing(fn(string $state): string => match ($state) {
                        'topup' => 'Nạp tiền',
                        'purchase' => 'Mua gói',
                        'refund' => 'Hoàn tiền',
                        'bonus' => 'Thưởng',
                        default => $state,
                    })
                    ->colors([
                        'success' => fn($state) => in_array($state, ['topup', 'refund', 'bonus']),
                        'danger' => 'purchase',
                    ]),
                Tables\Columns\TextColumn::make('amount')
                    ->label('Số tiền')
                    ->formatStateUsing(fn($state) => ($state > 0 ? '+' : '') . number_format($state, 0, ',', '.') . ' ₫')
                    ->color(fn($state) => $state > 0 ? 'success' : 'danger'),
                Tables\Columns\TextColumn::make('balance_after')
                    ->label('Số dư sau')
                    ->money('VND'),
                Tables\Columns\TextColumn::make('description')
                    ->label('Mô tả')
                    ->limit(30),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Thời gian')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('type')
                    ->label('Loại giao dịch')
                    ->options([
                        'topup' => 'Nạp tiền',
                        'purchase' => 'Mua gói',
                        'refund' => 'Hoàn tiền',
                        'bonus' => 'Thưởng',
                    ]),
                Tables\Filters\SelectFilter::make('company_id')
                    ->label('Công ty')
                    ->relationship('company', 'name')
                    ->searchable()
                    ->preload(),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
            ])
            ->bulkActions([]);
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListWalletTransactions::route('/'),
        ];
    }
}
