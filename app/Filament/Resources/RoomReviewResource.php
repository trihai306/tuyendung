<?php

declare(strict_types=1);

namespace App\Filament\Resources;

use App\Filament\Resources\RoomReviewResource\Pages;
use App\Models\RoomReview;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class RoomReviewResource extends Resource
{
    protected static ?string $model = RoomReview::class;

    protected static ?string $navigationIcon = 'heroicon-o-star';

    protected static ?string $navigationGroup = 'Phong tro';

    protected static ?string $navigationLabel = 'Danh gia';

    protected static ?string $modelLabel = 'Danh gia';

    protected static ?string $pluralModelLabel = 'Danh gia';

    protected static ?int $navigationSort = 5;

    public static function getGloballySearchableAttributes(): array
    {
        return ['room.title', 'user.name', 'comment'];
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Thong tin danh gia')
                    ->schema([
                        Forms\Components\Select::make('room_id')
                            ->label('Phong')
                            ->relationship('room', 'title')
                            ->searchable()
                            ->preload()
                            ->required(),
                        Forms\Components\Select::make('user_id')
                            ->label('Nguoi danh gia')
                            ->relationship('user', 'name')
                            ->searchable()
                            ->preload()
                            ->required(),
                        Forms\Components\Select::make('rating')
                            ->label('So sao')
                            ->options([
                                1 => '1 sao',
                                2 => '2 sao',
                                3 => '3 sao',
                                4 => '4 sao',
                                5 => '5 sao',
                            ])
                            ->required(),
                        Forms\Components\Textarea::make('comment')
                            ->label('Nhan xet')
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
                    ->label('Phong')
                    ->searchable()
                    ->sortable()
                    ->limit(30),
                Tables\Columns\TextColumn::make('user.name')
                    ->label('Nguoi danh gia')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('rating')
                    ->label('Sao')
                    ->sortable()
                    ->badge()
                    ->color(fn(int $state): string => match (true) {
                        $state >= 4 => 'success',
                        $state >= 3 => 'warning',
                        default => 'danger',
                    })
                    ->formatStateUsing(fn(int $state): string => $state . ' sao'),
                Tables\Columns\TextColumn::make('comment')
                    ->label('Nhan xet')
                    ->limit(50),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Ngay')
                    ->dateTime('d/m/Y')
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('rating')
                    ->label('So sao')
                    ->options([
                        1 => '1 sao',
                        2 => '2 sao',
                        3 => '3 sao',
                        4 => '4 sao',
                        5 => '5 sao',
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
            'index' => Pages\ListRoomReviews::route('/'),
            'create' => Pages\CreateRoomReview::route('/create'),
            'edit' => Pages\EditRoomReview::route('/{record}/edit'),
        ];
    }
}
