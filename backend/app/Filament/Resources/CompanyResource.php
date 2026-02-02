<?php

namespace App\Filament\Resources;

use App\Filament\Resources\CompanyResource\Pages;
use App\Filament\Resources\CompanyResource\RelationManagers;
use App\Models\Company;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class CompanyResource extends Resource
{
    protected static ?string $model = Company::class;

    protected static ?string $navigationIcon = 'heroicon-o-building-office-2';

    protected static ?string $navigationGroup = 'Hệ thống';

    protected static ?string $modelLabel = 'Doanh nghiệp';

    protected static ?string $pluralModelLabel = 'Doanh nghiệp';

    protected static ?int $navigationSort = 3;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Thông tin doanh nghiệp')
                    ->columns(2)
                    ->schema([
                        Forms\Components\TextInput::make('name')
                            ->label('Tên công ty')
                            ->required()
                            ->maxLength(255),
                        Forms\Components\TextInput::make('email')
                            ->label('Email')
                            ->email()
                            ->maxLength(255),
                        Forms\Components\TextInput::make('phone')
                            ->label('Điện thoại')
                            ->tel()
                            ->maxLength(20),
                        Forms\Components\TextInput::make('tax_code')
                            ->label('Mã số thuế')
                            ->maxLength(50),
                        Forms\Components\Select::make('size')
                            ->label('Quy mô')
                            ->options(Company::sizeOptions()),
                        Forms\Components\TextInput::make('website')
                            ->label('Website')
                            ->url()
                            ->maxLength(255),
                        Forms\Components\Textarea::make('address')
                            ->label('Địa chỉ')
                            ->rows(2)
                            ->columnSpanFull(),
                        Forms\Components\Textarea::make('description')
                            ->label('Mô tả')
                            ->rows(3)
                            ->columnSpanFull(),
                    ]),

                Forms\Components\Section::make('Tài khoản')
                    ->columns(2)
                    ->schema([
                        Forms\Components\Select::make('status')
                            ->label('Trạng thái')
                            ->options([
                                'active' => 'Hoạt động',
                                'suspended' => 'Tạm khóa',
                                'expired' => 'Hết hạn',
                            ])
                            ->default('active')
                            ->required(),
                        Forms\Components\TextInput::make('balance')
                            ->label('Số dư')
                            ->numeric()
                            ->default(0)
                            ->prefix('₫')
                            ->disabled(),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->label('Tên công ty')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('email')
                    ->label('Email')
                    ->searchable(),
                Tables\Columns\TextColumn::make('size')
                    ->label('Quy mô')
                    ->badge(),
                Tables\Columns\TextColumn::make('balance')
                    ->label('Số dư')
                    ->money('VND')
                    ->sortable(),
                Tables\Columns\BadgeColumn::make('status')
                    ->label('Trạng thái')
                    ->colors([
                        'success' => 'active',
                        'warning' => 'suspended',
                        'danger' => 'expired',
                    ]),
                Tables\Columns\TextColumn::make('members_count')
                    ->label('Nhân viên')
                    ->counts('members'),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Ngày tạo')
                    ->dateTime('d/m/Y')
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->label('Trạng thái')
                    ->options([
                        'active' => 'Hoạt động',
                        'suspended' => 'Tạm khóa',
                        'expired' => 'Hết hạn',
                    ]),
            ])
            ->actions([
                Tables\Actions\Action::make('addBalance')
                    ->label('Nạp tiền')
                    ->icon('heroicon-o-plus-circle')
                    ->color('success')
                    ->form([
                        Forms\Components\TextInput::make('amount')
                            ->label('Số tiền')
                            ->numeric()
                            ->required()
                            ->prefix('₫'),
                        Forms\Components\Textarea::make('note')
                            ->label('Ghi chú')
                            ->rows(2),
                    ])
                    ->action(function (Company $record, array $data) {
                        $record->addBalance($data['amount'], 'topup', $data['note'] ?? 'Nạp tiền thủ công');
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
        return [
            RelationManagers\MembersRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListCompanies::route('/'),
            'create' => Pages\CreateCompany::route('/create'),
            'edit' => Pages\EditCompany::route('/{record}/edit'),
        ];
    }
}
