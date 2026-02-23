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

    protected static ?string $navigationGroup = 'Tuyển dụng';

    protected static ?string $navigationLabel = 'Phỏng vấn';

    protected static ?string $modelLabel = 'Phỏng vấn';

    protected static ?string $pluralModelLabel = 'Phỏng vấn';

    protected static ?int $navigationSort = 4;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make()
                    ->schema([
                        Forms\Components\Select::make('application_id')
                            ->label('Đơn ứng tuyển')
                            ->relationship('application', 'id')
                            ->searchable()
                            ->preload()
                            ->required(),
                        Forms\Components\DateTimePicker::make('scheduled_at')
                            ->label('Thời gian')
                            ->required(),
                        Forms\Components\Select::make('type')
                            ->label('Hình thức')
                            ->options([
                                'in_person' => 'Truc tiep',
                                'online' => 'Truc tuyen',
                                'phone' => 'Dien thoai',
                            ])
                            ->required(),
                        Forms\Components\Select::make('status')
                            ->label('Trạng thái')
                            ->options([
                                'scheduled' => 'Da len lich',
                                'completed' => 'Hoan thanh',
                                'cancelled' => 'Da huy',
                                'rescheduled' => 'Doi lich',
                            ])
                            ->default('scheduled')
                            ->required(),
                        Forms\Components\TextInput::make('location')
                            ->label('Địa điểm')
                            ->maxLength(255),
                        Forms\Components\TextInput::make('meeting_url')
                            ->label('Link meeting')
                            ->url()
                            ->maxLength(255),
                        Forms\Components\Select::make('result')
                            ->label('Kết quả')
                            ->options([
                                'pass' => 'Dat',
                                'fail' => 'Khong dat',
                                'pending' => 'Cho ket qua',
                            ])
                            ->nullable(),
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
                Tables\Columns\TextColumn::make('application.id')
                    ->label('Mã đơn')
                    ->sortable(),
                Tables\Columns\TextColumn::make('scheduled_at')
                    ->label('Thời gian')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
                Tables\Columns\TextColumn::make('type')
                    ->label('Hình thức')
                    ->badge(),
                Tables\Columns\TextColumn::make('status')
                    ->label('Trạng thái')
                    ->badge()
                    ->color(fn(string $state): string => match ($state) {
                        'completed' => 'success',
                        'cancelled' => 'danger',
                        'rescheduled' => 'warning',
                        default => 'info',
                    }),
                Tables\Columns\TextColumn::make('result')
                    ->label('Kết quả')
                    ->badge()
                    ->color(fn(?string $state): string => match ($state) {
                        'pass' => 'success',
                        'fail' => 'danger',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('location')
                    ->label('Địa điểm')
                    ->limit(30)
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->defaultSort('scheduled_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'scheduled' => 'Da len lich',
                        'completed' => 'Hoan thanh',
                        'cancelled' => 'Da huy',
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
