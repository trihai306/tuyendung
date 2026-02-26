<?php

declare(strict_types=1);

namespace App\Filament\Resources;

use App\Filament\Resources\AiAgentResource\Pages;
use App\Models\AiAgent;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class AiAgentResource extends Resource
{
    protected static ?string $model = AiAgent::class;

    protected static ?string $navigationIcon = 'heroicon-o-cpu-chip';

    protected static ?string $navigationGroup = 'AI & Tu dong hoa';

    protected static ?string $navigationLabel = 'Tro ly AI';

    protected static ?string $modelLabel = 'Tro ly AI';

    protected static ?string $pluralModelLabel = 'Tro ly AI';

    protected static ?int $navigationSort = 1;

    public static function getNavigationBadge(): ?string
    {
        return (string) static::getModel()::where('is_global', true)->count();
    }

    public static function getNavigationBadgeColor(): string|array|null
    {
        return 'primary';
    }

    public static function getGloballySearchableAttributes(): array
    {
        return ['name', 'type', 'description'];
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Thong tin co ban')
                    ->schema([
                        Forms\Components\TextInput::make('name')
                            ->label('Ten tro ly')
                            ->required()
                            ->maxLength(255),
                        Forms\Components\Select::make('type')
                            ->label('Loai')
                            ->options([
                                'messaging' => 'Tin nhan (Zalo/Facebook)',
                                'posting' => 'Dang tin tuyen dung',
                                'recruiting' => 'Ho tro tuyen dung',
                            ])
                            ->required(),
                        Forms\Components\Select::make('status')
                            ->label('Trang thai')
                            ->options([
                                'active' => 'Hoat dong',
                                'paused' => 'Tam dung',
                                'disabled' => 'Da tat',
                            ])
                            ->default('active')
                            ->required(),
                        Forms\Components\Toggle::make('is_global')
                            ->label('Hien thi cho tat ca cong ty')
                            ->default(true),
                    ])
                    ->columns(2),

                Forms\Components\Section::make('Mo ta')
                    ->schema([
                        Forms\Components\Textarea::make('description')
                            ->label('Mo ta chi tiet')
                            ->rows(3)
                            ->columnSpanFull(),
                    ]),

                Forms\Components\Section::make('Cau hinh mac dinh')
                    ->schema([
                        Forms\Components\KeyValue::make('config')
                            ->label('Config (JSON)')
                            ->default([])
                            ->columnSpanFull(),
                        Forms\Components\KeyValue::make('schedule')
                            ->label('Lich tuy chinh')
                            ->default([])
                            ->columnSpanFull(),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->label('Ten')
                    ->searchable()
                    ->sortable()
                    ->limit(30),
                Tables\Columns\TextColumn::make('type')
                    ->label('Loai')
                    ->badge()
                    ->color(fn(string $state): string => match ($state) {
                        'messaging' => 'info',
                        'posting' => 'success',
                        'recruiting' => 'warning',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn(string $state): string => match ($state) {
                        'messaging' => 'Tin nhan',
                        'posting' => 'Dang tin',
                        'recruiting' => 'Tuyen dung',
                        default => $state,
                    }),
                Tables\Columns\TextColumn::make('status')
                    ->label('Trang thai')
                    ->badge()
                    ->color(fn(string $state): string => match ($state) {
                        'active' => 'success',
                        'paused' => 'warning',
                        'disabled' => 'danger',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn(string $state): string => match ($state) {
                        'active' => 'Hoat dong',
                        'paused' => 'Tam dung',
                        'disabled' => 'Da tat',
                        default => $state,
                    }),
                Tables\Columns\IconColumn::make('is_global')
                    ->label('Cong khai')
                    ->boolean(),
                Tables\Columns\TextColumn::make('company_activations_count')
                    ->counts('companyActivations')
                    ->label('Cong ty dung')
                    ->sortable(),
                Tables\Columns\TextColumn::make('scenarios_count')
                    ->counts('scenarios')
                    ->label('Kich ban')
                    ->sortable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Ngay tao')
                    ->dateTime('d/m/Y')
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('type')
                    ->label('Loai')
                    ->options([
                        'messaging' => 'Tin nhan',
                        'posting' => 'Dang tin',
                        'recruiting' => 'Tuyen dung',
                    ]),
                Tables\Filters\SelectFilter::make('status')
                    ->label('Trang thai')
                    ->options([
                        'active' => 'Hoat dong',
                        'paused' => 'Tam dung',
                        'disabled' => 'Da tat',
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
            'index' => Pages\ListAiAgents::route('/'),
            'create' => Pages\CreateAiAgent::route('/create'),
            'edit' => Pages\EditAiAgent::route('/{record}/edit'),
        ];
    }
}
