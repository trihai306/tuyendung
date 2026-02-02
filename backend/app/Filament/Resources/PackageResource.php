<?php

namespace App\Filament\Resources;

use App\Filament\Resources\PackageResource\Pages;
use App\Models\Package;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class PackageResource extends Resource
{
    protected static ?string $model = Package::class;

    protected static ?string $navigationIcon = 'heroicon-o-cube';

    protected static ?string $navigationGroup = 'Hệ thống';

    protected static ?string $modelLabel = 'Gói dịch vụ';

    protected static ?string $pluralModelLabel = 'Gói dịch vụ';

    protected static ?int $navigationSort = 4;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Thông tin gói')
                    ->columns(2)
                    ->schema([
                        Forms\Components\TextInput::make('name')
                            ->label('Tên gói')
                            ->required()
                            ->maxLength(255),
                        Forms\Components\TextInput::make('price')
                            ->label('Giá')
                            ->numeric()
                            ->required()
                            ->prefix('₫'),
                        Forms\Components\TextInput::make('duration_days')
                            ->label('Thời hạn (ngày)')
                            ->numeric()
                            ->default(30)
                            ->required(),
                        Forms\Components\TextInput::make('sort_order')
                            ->label('Thứ tự')
                            ->numeric()
                            ->default(0),
                        Forms\Components\Textarea::make('description')
                            ->label('Mô tả')
                            ->rows(3)
                            ->columnSpanFull(),
                    ]),

                Forms\Components\Section::make('Giới hạn')
                    ->columns(4)
                    ->schema([
                        Forms\Components\TextInput::make('max_users')
                            ->label('Số thành viên')
                            ->numeric()
                            ->default(5)
                            ->required()
                            ->helperText('-1 = không giới hạn'),
                        Forms\Components\TextInput::make('max_social_accounts')
                            ->label('Số tài khoản MXH')
                            ->numeric()
                            ->default(1)
                            ->required()
                            ->helperText('-1 = không giới hạn'),
                        Forms\Components\TextInput::make('max_jobs')
                            ->label('Số tin tuyển dụng')
                            ->numeric()
                            ->default(10)
                            ->required()
                            ->helperText('-1 = không giới hạn'),
                        Forms\Components\TextInput::make('max_candidates')
                            ->label('Số ứng viên')
                            ->numeric()
                            ->default(100)
                            ->required()
                            ->helperText('-1 = không giới hạn'),
                    ]),

                Forms\Components\Section::make('Tính năng')
                    ->schema([
                        Forms\Components\TagsInput::make('features')
                            ->label('Tính năng bao gồm')
                            ->placeholder('Thêm tính năng')
                            ->columnSpanFull(),
                    ]),

                Forms\Components\Section::make('Cài đặt')
                    ->columns(2)
                    ->schema([
                        Forms\Components\Toggle::make('is_active')
                            ->label('Kích hoạt')
                            ->default(true),
                        Forms\Components\Toggle::make('is_popular')
                            ->label('Gói phổ biến')
                            ->default(false),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->label('Tên gói')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('price')
                    ->label('Giá')
                    ->money('VND')
                    ->sortable(),
                Tables\Columns\TextColumn::make('duration_days')
                    ->label('Thời hạn')
                    ->suffix(' ngày'),
                Tables\Columns\TextColumn::make('max_users')
                    ->label('Thành viên')
                    ->formatStateUsing(fn($state) => $state == -1 ? '∞' : $state),
                Tables\Columns\TextColumn::make('max_social_accounts')
                    ->label('TK MXH')
                    ->formatStateUsing(fn($state) => $state == -1 ? '∞' : $state),
                Tables\Columns\TextColumn::make('max_jobs')
                    ->label('Tin TD')
                    ->formatStateUsing(fn($state) => $state == -1 ? '∞' : $state),
                Tables\Columns\TextColumn::make('max_candidates')
                    ->label('Ứng viên')
                    ->formatStateUsing(fn($state) => $state == -1 ? '∞' : $state),
                Tables\Columns\IconColumn::make('is_active')
                    ->label('Kích hoạt')
                    ->boolean(),
                Tables\Columns\IconColumn::make('is_popular')
                    ->label('Phổ biến')
                    ->boolean()
                    ->trueColor('warning'),
                Tables\Columns\TextColumn::make('subscriptions_count')
                    ->label('Đăng ký')
                    ->counts('subscriptions'),
            ])
            ->defaultSort('sort_order')
            ->reorderable('sort_order')
            ->filters([
                Tables\Filters\TernaryFilter::make('is_active')
                    ->label('Kích hoạt'),
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
            'index' => Pages\ListPackages::route('/'),
            'create' => Pages\CreatePackage::route('/create'),
            'edit' => Pages\EditPackage::route('/{record}/edit'),
        ];
    }
}
