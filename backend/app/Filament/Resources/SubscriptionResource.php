<?php

namespace App\Filament\Resources;

use App\Filament\Resources\SubscriptionResource\Pages;
use App\Models\Subscription;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class SubscriptionResource extends Resource
{
    protected static ?string $model = Subscription::class;

    protected static ?string $navigationIcon = 'heroicon-o-credit-card';

    protected static ?string $navigationGroup = 'Hệ thống';

    protected static ?string $modelLabel = 'Đăng ký gói';

    protected static ?string $pluralModelLabel = 'Đăng ký gói';

    protected static ?int $navigationSort = 6;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Thông tin đăng ký')
                    ->columns(2)
                    ->schema([
                        Forms\Components\Select::make('company_id')
                            ->label('Công ty')
                            ->relationship('company', 'name')
                            ->searchable()
                            ->preload()
                            ->required(),
                        Forms\Components\Select::make('package_id')
                            ->label('Gói dịch vụ')
                            ->relationship('package', 'name')
                            ->searchable()
                            ->preload()
                            ->required(),
                        Forms\Components\DateTimePicker::make('starts_at')
                            ->label('Bắt đầu')
                            ->required()
                            ->default(now()),
                        Forms\Components\DateTimePicker::make('expires_at')
                            ->label('Hết hạn')
                            ->required(),
                        Forms\Components\TextInput::make('amount_paid')
                            ->label('Số tiền thanh toán')
                            ->numeric()
                            ->required()
                            ->prefix('₫'),
                        Forms\Components\Select::make('status')
                            ->label('Trạng thái')
                            ->options([
                                'active' => 'Đang hoạt động',
                                'expired' => 'Hết hạn',
                                'cancelled' => 'Đã hủy',
                            ])
                            ->default('active')
                            ->required(),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('company.name')
                    ->label('Công ty')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('package.name')
                    ->label('Gói')
                    ->badge()
                    ->color('primary'),
                Tables\Columns\TextColumn::make('starts_at')
                    ->label('Bắt đầu')
                    ->dateTime('d/m/Y')
                    ->sortable(),
                Tables\Columns\TextColumn::make('expires_at')
                    ->label('Hết hạn')
                    ->dateTime('d/m/Y')
                    ->sortable()
                    ->color(fn(Subscription $record) => $record->isExpired() ? 'danger' : null),
                Tables\Columns\TextColumn::make('daysRemaining')
                    ->label('Còn lại')
                    ->suffix(' ngày')
                    ->color(fn(Subscription $record) => $record->daysRemaining() < 7 ? 'warning' : 'success'),
                Tables\Columns\TextColumn::make('amount_paid')
                    ->label('Đã thanh toán')
                    ->money('VND'),
                Tables\Columns\BadgeColumn::make('status')
                    ->label('Trạng thái')
                    ->formatStateUsing(fn(string $state): string => match ($state) {
                        'active' => 'Hoạt động',
                        'expired' => 'Hết hạn',
                        'cancelled' => 'Đã hủy',
                        default => $state,
                    })
                    ->colors([
                        'success' => 'active',
                        'danger' => 'expired',
                        'gray' => 'cancelled',
                    ]),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->label('Trạng thái')
                    ->options([
                        'active' => 'Hoạt động',
                        'expired' => 'Hết hạn',
                        'cancelled' => 'Đã hủy',
                    ]),
                Tables\Filters\SelectFilter::make('package_id')
                    ->label('Gói')
                    ->relationship('package', 'name'),
            ])
            ->actions([
                Tables\Actions\Action::make('extend')
                    ->label('Gia hạn')
                    ->icon('heroicon-o-arrow-path')
                    ->color('success')
                    ->form([
                        Forms\Components\TextInput::make('days')
                            ->label('Số ngày gia hạn')
                            ->numeric()
                            ->default(30)
                            ->required(),
                    ])
                    ->action(function (Subscription $record, array $data) {
                        $record->update([
                            'expires_at' => $record->expires_at->addDays($data['days']),
                            'status' => 'active',
                        ]);
                    }),
                Tables\Actions\EditAction::make(),
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
            'index' => Pages\ListSubscriptions::route('/'),
            'create' => Pages\CreateSubscription::route('/create'),
            'edit' => Pages\EditSubscription::route('/{record}/edit'),
        ];
    }
}
