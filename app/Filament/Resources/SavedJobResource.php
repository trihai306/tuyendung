<?php

declare(strict_types=1);

namespace App\Filament\Resources;

use App\Filament\Resources\SavedJobResource\Pages;
use App\Models\SavedJob;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class SavedJobResource extends Resource
{
    protected static ?string $model = SavedJob::class;

    protected static ?string $navigationIcon = 'heroicon-o-bookmark';

    protected static ?string $navigationGroup = 'Tuyen dung';

    protected static ?string $navigationLabel = 'Viec da luu';

    protected static ?string $modelLabel = 'Viec da luu';

    protected static ?string $pluralModelLabel = 'Viec da luu';

    protected static ?int $navigationSort = 5;

    public static function getGloballySearchableAttributes(): array
    {
        return ['user.name', 'jobPost.title'];
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('user_id')
                    ->label('Nguoi dung')
                    ->relationship('user', 'name')
                    ->searchable()
                    ->preload()
                    ->required(),
                Forms\Components\Select::make('job_post_id')
                    ->label('Tin tuyen dung')
                    ->relationship('jobPost', 'title')
                    ->searchable()
                    ->preload()
                    ->required(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('user.name')
                    ->label('Nguoi dung')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('jobPost.title')
                    ->label('Tin tuyen dung')
                    ->searchable()
                    ->sortable()
                    ->limit(40),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Ngay luu')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([])
            ->actions([
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
            'index' => Pages\ListSavedJobs::route('/'),
            'create' => Pages\CreateSavedJob::route('/create'),
            'edit' => Pages\EditSavedJob::route('/{record}/edit'),
        ];
    }
}
