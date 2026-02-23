<?php

declare(strict_types=1);

namespace App\Filament\Resources;

use App\Filament\Resources\ApplicationResource\Pages;
use App\Models\Application;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class ApplicationResource extends Resource
{
    protected static ?string $model = Application::class;

    protected static ?string $navigationIcon = 'heroicon-o-document-text';

    protected static ?string $navigationGroup = 'Tuyển dụng';

    protected static ?string $navigationLabel = 'Đơn ứng tuyển';

    protected static ?string $modelLabel = 'Đơn ứng tuyển';

    protected static ?string $pluralModelLabel = 'Đơn ứng tuyển';

    protected static ?int $navigationSort = 3;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make()
                    ->schema([
                        Forms\Components\Select::make('job_post_id')
                            ->label('Tin tuyển dụng')
                            ->relationship('jobPost', 'title')
                            ->searchable()
                            ->preload()
                            ->required(),
                        Forms\Components\Select::make('candidate_id')
                            ->label('Ứng viên')
                            ->relationship('candidate', 'name')
                            ->searchable()
                            ->preload()
                            ->required(),
                        Forms\Components\Select::make('status')
                            ->label('Trạng thái')
                            ->options([
                                'pending' => 'Cho duyet',
                                'reviewing' => 'Dang xem xet',
                                'shortlisted' => 'Vao vong',
                                'interview' => 'Phỏng vấn',
                                'accepted' => 'Chap nhan',
                                'rejected' => 'Tu choi',
                            ])
                            ->default('pending')
                            ->required(),
                        Forms\Components\Textarea::make('cover_letter')
                            ->label('Thu xin viec')
                            ->columnSpanFull(),
                        Forms\Components\TextInput::make('resume_url')
                            ->label('CV URL')
                            ->url()
                            ->maxLength(255),
                        Forms\Components\Textarea::make('employer_notes')
                            ->label('Ghi chu NTD')
                            ->columnSpanFull(),
                        Forms\Components\DateTimePicker::make('applied_at')
                            ->label('Ngay ung tuyen'),
                        Forms\Components\DateTimePicker::make('reviewed_at')
                            ->label('Ngay xem xet'),
                    ])
                    ->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('jobPost.title')
                    ->label('Tin tuyển dụng')
                    ->searchable()
                    ->sortable()
                    ->limit(30),
                Tables\Columns\TextColumn::make('candidate.name')
                    ->label('Ứng viên')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('status')
                    ->label('Trạng thái')
                    ->badge()
                    ->color(fn(string $state): string => match ($state) {
                        'accepted' => 'success',
                        'rejected' => 'danger',
                        'interview', 'shortlisted' => 'warning',
                        'reviewing' => 'info',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('applied_at')
                    ->label('Ngay ung tuyen')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
                Tables\Columns\TextColumn::make('reviewed_at')
                    ->label('Ngay xem xet')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
            ])
            ->defaultSort('applied_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->label('Trạng thái')
                    ->options([
                        'pending' => 'Cho duyet',
                        'reviewing' => 'Dang xem xet',
                        'shortlisted' => 'Vao vong',
                        'interview' => 'Phỏng vấn',
                        'accepted' => 'Chap nhan',
                        'rejected' => 'Tu choi',
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
            'index' => Pages\ListApplications::route('/'),
            'create' => Pages\CreateApplication::route('/create'),
            'edit' => Pages\EditApplication::route('/{record}/edit'),
        ];
    }
}
