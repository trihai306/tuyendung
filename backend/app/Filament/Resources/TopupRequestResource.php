<?php

namespace App\Filament\Resources;

use App\Filament\Resources\TopupRequestResource\Pages;
use App\Models\TopupRequest;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Notifications\Notification;

class TopupRequestResource extends Resource
{
    protected static ?string $model = TopupRequest::class;

    protected static ?string $navigationIcon = 'heroicon-o-banknotes';

    protected static ?string $navigationGroup = 'Hệ thống';

    protected static ?string $modelLabel = 'Yêu cầu nạp tiền';

    protected static ?string $pluralModelLabel = 'Yêu cầu nạp tiền';

    protected static ?int $navigationSort = 5;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Thông tin yêu cầu')
                    ->columns(2)
                    ->schema([
                        Forms\Components\Select::make('company_id')
                            ->label('Công ty')
                            ->relationship('company', 'name')
                            ->searchable()
                            ->preload()
                            ->required(),
                        Forms\Components\Select::make('user_id')
                            ->label('Người yêu cầu')
                            ->relationship('user', 'name')
                            ->searchable()
                            ->preload()
                            ->required(),
                        Forms\Components\TextInput::make('amount')
                            ->label('Số tiền')
                            ->numeric()
                            ->required()
                            ->prefix('₫'),
                        Forms\Components\Select::make('payment_method')
                            ->label('Phương thức')
                            ->options([
                                'bank_transfer' => 'Chuyển khoản ngân hàng',
                                'momo' => 'Ví MoMo',
                                'vnpay' => 'VNPay',
                                'cash' => 'Tiền mặt',
                            ])
                            ->required(),
                        Forms\Components\Select::make('status')
                            ->label('Trạng thái')
                            ->options([
                                'pending' => 'Chờ xử lý',
                                'processing' => 'Đang xử lý',
                                'completed' => 'Hoàn thành',
                                'failed' => 'Thất bại',
                                'cancelled' => 'Đã hủy',
                            ])
                            ->default('pending')
                            ->required(),
                        Forms\Components\TextInput::make('transaction_id')
                            ->label('Mã giao dịch')
                            ->maxLength(255),
                        Forms\Components\Textarea::make('note')
                            ->label('Ghi chú')
                            ->rows(2)
                            ->columnSpanFull(),
                    ]),
            ]);
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
                    ->label('Người yêu cầu')
                    ->searchable(),
                Tables\Columns\TextColumn::make('amount')
                    ->label('Số tiền')
                    ->money('VND')
                    ->sortable(),
                Tables\Columns\TextColumn::make('payment_method')
                    ->label('Phương thức')
                    ->badge()
                    ->formatStateUsing(fn(string $state): string => match ($state) {
                        'bank_transfer' => 'Chuyển khoản',
                        'momo' => 'MoMo',
                        'vnpay' => 'VNPay',
                        'cash' => 'Tiền mặt',
                        default => $state,
                    }),
                Tables\Columns\BadgeColumn::make('status')
                    ->label('Trạng thái')
                    ->formatStateUsing(fn(string $state): string => match ($state) {
                        'pending' => 'Chờ xử lý',
                        'processing' => 'Đang xử lý',
                        'completed' => 'Hoàn thành',
                        'failed' => 'Thất bại',
                        'cancelled' => 'Đã hủy',
                        default => $state,
                    })
                    ->colors([
                        'warning' => 'pending',
                        'info' => 'processing',
                        'success' => 'completed',
                        'danger' => 'failed',
                        'gray' => 'cancelled',
                    ]),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Ngày tạo')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->label('Trạng thái')
                    ->options([
                        'pending' => 'Chờ xử lý',
                        'processing' => 'Đang xử lý',
                        'completed' => 'Hoàn thành',
                        'failed' => 'Thất bại',
                        'cancelled' => 'Đã hủy',
                    ]),
                Tables\Filters\SelectFilter::make('payment_method')
                    ->label('Phương thức')
                    ->options([
                        'bank_transfer' => 'Chuyển khoản ngân hàng',
                        'momo' => 'MoMo',
                        'vnpay' => 'VNPay',
                        'cash' => 'Tiền mặt',
                    ]),
            ])
            ->actions([
                Tables\Actions\Action::make('approve')
                    ->label('Duyệt')
                    ->icon('heroicon-o-check')
                    ->color('success')
                    ->requiresConfirmation()
                    ->modalHeading('Xác nhận duyệt nạp tiền')
                    ->modalDescription(fn(TopupRequest $record) => "Bạn có chắc muốn duyệt nạp " . number_format($record->amount, 0, ',', '.') . " ₫ cho " . $record->company->name . "?")
                    ->visible(fn(TopupRequest $record) => $record->status === 'pending')
                    ->action(function (TopupRequest $record) {
                        $record->complete();
                        Notification::make()
                            ->success()
                            ->title('Đã duyệt nạp tiền')
                            ->body('Số dư đã được cộng vào tài khoản công ty.')
                            ->send();
                    }),
                Tables\Actions\Action::make('reject')
                    ->label('Từ chối')
                    ->icon('heroicon-o-x-mark')
                    ->color('danger')
                    ->requiresConfirmation()
                    ->visible(fn(TopupRequest $record) => $record->status === 'pending')
                    ->action(function (TopupRequest $record) {
                        $record->fail();
                        Notification::make()
                            ->warning()
                            ->title('Đã từ chối yêu cầu')
                            ->send();
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
            'index' => Pages\ListTopupRequests::route('/'),
            'create' => Pages\CreateTopupRequest::route('/create'),
            'edit' => Pages\EditTopupRequest::route('/{record}/edit'),
        ];
    }
}
