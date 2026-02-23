<?php

declare(strict_types=1);

namespace App\Filament\Resources;

use App\Filament\Resources\InterviewResource\Pages;
use App\Models\Interview;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class InterviewResource extends Resource
{
    protected static ?string $model = Interview::class;

    protected static ?string $navigationIcon = 'heroicon-o-calendar-days';

    protected static ?string $navigationGroup = 'Tuyen dung';

    protected static ?string $navigationLabel = 'Phong van';

    protected static ?string $modelLabel = 'Phong van';

    protected static ?string $pluralModelLabel = 'Phong van';

    protected static ?int $navigationSort = 4;

    public static function getGloballySearchableAttributes(): array
    {
        return ['location', 'notes'];
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Thong tin phong van')
                    ->schema([
                        Forms\Components\Select::make('application_id')
                            ->label('Don ung tuyen')
                            ->relationship('application', 'id')
                            ->searchable()
                            ->preload()
                            ->required(),
                        Forms\Components\DateTimePicker::make('scheduled_at')
                            ->label('Thoi gian')
                            ->required(),
                        Forms\Components\Select::make('type')
                            ->label('Hinh thuc')
                            ->options([
                                'in_person' => 'Truc tiep',
                                'online' => 'Truc tuyen',
                                'phone' => 'Dien thoai',
                            ])
                            ->required(),
                        Forms\Components\Select::make('status')
                            ->label('Trang thai')
                            ->options([
                                'scheduled' => 'Da len lich',
                                'completed' => 'Hoan thanh',
                                'cancelled' => 'Da huy',
                                'rescheduled' => 'Doi lich',
                            ])
                            ->default('scheduled')
                            ->required(),
                        Forms\Components\TextInput::make('location')
                            ->label('Dia diem')
                            ->maxLength(255),
                        Forms\Components\TextInput::make('meeting_url')
                            ->label('Link meeting')
                            ->url()
                            ->maxLength(255),
                        Forms\Components\Select::make('result')
                            ->label('Ket qua')
                            ->options([
                                'pass' => 'Dat',
                                'fail' => 'Khong dat',
                                'pending' => 'Cho ket qua',
                            ])
                            ->nullable(),
                        Forms\Components\Textarea::make('notes')
                            ->label('Ghi chu')
                            ->columnSpanFull(),
                    ])
                    ->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('application.id')
                    ->label('Ma don')
                    ->sortable(),
                Tables\Columns\TextColumn::make('scheduled_at')
                    ->label('Thoi gian')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
                Tables\Columns\TextColumn::make('type')
                    ->label('Hinh thuc')
                    ->badge()
                    ->formatStateUsing(fn(string $state): string => match ($state) {
                        'in_person' => 'Truc tiep',
                        'online' => 'Truc tuyen',
                        'phone' => 'Dien thoai',
                        default => $state,
                    }),
                Tables\Columns\TextColumn::make('status')
                    ->label('Trang thai')
                    ->badge()
                    ->color(fn(string $state): string => match ($state) {
                        'completed' => 'success',
                        'cancelled' => 'danger',
                        'rescheduled' => 'warning',
                        default => 'info',
                    })
                    ->formatStateUsing(fn(string $state): string => match ($state) {
                        'scheduled' => 'Da len lich',
                        'completed' => 'Hoan thanh',
                        'cancelled' => 'Da huy',
                        'rescheduled' => 'Doi lich',
                        default => $state,
                    }),
                Tables\Columns\TextColumn::make('result')
                    ->label('Ket qua')
                    ->badge()
                    ->color(fn(?string $state): string => match ($state) {
                        'pass' => 'success',
                        'fail' => 'danger',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn(?string $state): string => match ($state) {
                        'pass' => 'Dat',
                        'fail' => 'Khong dat',
                        'pending' => 'Cho KQ',
                        default => $state ?? '-',
                    }),
                Tables\Columns\TextColumn::make('location')
                    ->label('Dia diem')
                    ->limit(30)
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->defaultSort('scheduled_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->label('Trang thai')
                    ->options([
                        'scheduled' => 'Da len lich',
                        'completed' => 'Hoan thanh',
                        'cancelled' => 'Da huy',
                    ]),
                Tables\Filters\SelectFilter::make('result')
                    ->label('Ket qua')
                    ->options([
                        'pass' => 'Dat',
                        'fail' => 'Khong dat',
                        'pending' => 'Cho ket qua',
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
            'index' => Pages\ListInterviews::route('/'),
            'create' => Pages\CreateInterview::route('/create'),
            'edit' => Pages\EditInterview::route('/{record}/edit'),
        ];
    }
}
