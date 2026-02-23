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

    protected static ?string $navigationGroup = 'Tuyển dụng';

    protected static ?string $navigationLabel = 'Việc đã lưu';

    protected static ?string $modelLabel = 'Việc đã lưu';

    protected static ?string $pluralModelLabel = 'Việc đã lưu';

    protected static ?int $navigationSort = 5;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('user_id')
                    ->label('Người dùng')
                    ->relationship('user', 'name')
                    ->searchable()
                    ->preload()
                    ->required(),
                Forms\Components\Select::make('job_post_id')
                    ->label('Tin tuyển dụng')
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
                    ->label('Người dùng')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('jobPost.title')
                    ->label('Tin tuyển dụng')
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
