<?php

declare(strict_types=1);

namespace App\Filament\Resources;

use App\Filament\Resources\TenantContractResource\Pages;
use App\Models\TenantContract;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class TenantContractResource extends Resource
{
    protected static ?string $model = TenantContract::class;

    protected static ?string $navigationIcon = 'heroicon-o-document-check';

    protected static ?string $navigationGroup = 'Phòng trọ';

    protected static ?string $navigationLabel = 'Hợp đồng';

    protected static ?string $modelLabel = 'Hợp đồng';

    protected static ?string $pluralModelLabel = 'Hợp đồng';

    protected static ?int $navigationSort = 2;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make()
                    ->schema([
                        Forms\Components\Select::make('room_id')
                            ->label('Phòng')
                            ->relationship('room', 'title')
                            ->searchable()
                            ->preload()
                            ->required(),
                        Forms\Components\Select::make('tenant_id')
                            ->label('Người thuê')
                            ->relationship('tenant', 'name')
                            ->searchable()
                            ->preload()
                            ->required(),
                        Forms\Components\DatePicker::make('start_date')
                            ->label('Ngày bắt đầu')
                            ->required(),
                        Forms\Components\DatePicker::make('end_date')
                            ->label('Ngày kết thúc'),
                        Forms\Components\TextInput::make('monthly_rent')
                            ->label('Tien thue/thang')
                            ->numeric()
                            ->prefix('VND')
                            ->required(),
                        Forms\Components\TextInput::make('deposit')
                            ->label('Tiền cọc')
                            ->numeric()
                            ->prefix('VND'),
                        Forms\Components\Select::make('status')
                            ->label('Trạng thái')
                            ->options([
                                'active' => 'Dang hieu luc',
                                'expired' => 'Het han',
                                'terminated' => 'Da cham dut',
                            ])
                            ->default('active')
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
                Tables\Columns\TextColumn::make('room.title')
                    ->label('Phòng')
                    ->searchable()
                    ->sortable()
                    ->limit(30),
                Tables\Columns\TextColumn::make('tenant.name')
                    ->label('Người thuê')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('monthly_rent')
                    ->label('Tien thue')
                    ->numeric()
                    ->suffix(' VND')
                    ->sortable(),
                Tables\Columns\TextColumn::make('start_date')
                    ->label('Bat dau')
                    ->date('d/m/Y')
                    ->sortable(),
                Tables\Columns\TextColumn::make('end_date')
                    ->label('Ket thuc')
                    ->date('d/m/Y')
                    ->sortable(),
                Tables\Columns\TextColumn::make('status')
                    ->label('Trạng thái')
                    ->badge()
                    ->color(fn(string $state): string => match ($state) {
                        'active' => 'success',
                        'expired' => 'warning',
                        'terminated' => 'danger',
                        default => 'gray',
                    }),
            ])
            ->defaultSort('start_date', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'active' => 'Dang hieu luc',
                        'expired' => 'Het han',
                        'terminated' => 'Da cham dut',
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
            'index' => Pages\ListTenantContracts::route('/'),
            'create' => Pages\CreateTenantContract::route('/create'),
            'edit' => Pages\EditTenantContract::route('/{record}/edit'),
        ];
    }
}
