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

    protected static ?string $navigationGroup = 'Tuyen dung';

    protected static ?string $navigationLabel = 'Don ung tuyen';

    protected static ?string $modelLabel = 'Don ung tuyen';

    protected static ?string $pluralModelLabel = 'Don ung tuyen';

    protected static ?int $navigationSort = 3;

    public static function getNavigationBadge(): ?string
    {
        return (string) static::getModel()::where('status', 'pending')->count();
    }

    public static function getNavigationBadgeColor(): string|array|null
    {
        $count = static::getModel()::where('status', 'pending')->count();
        return $count > 0 ? 'warning' : 'gray';
    }

    public static function getGloballySearchableAttributes(): array
    {
        return ['jobPost.title', 'candidate.name', 'candidate_name'];
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Thong tin don ung tuyen')
                    ->schema([
                        Forms\Components\Select::make('job_post_id')
                            ->label('Tin tuyen dung')
                            ->relationship('jobPost', 'title')
                            ->searchable()
                            ->preload()
                            ->required(),
                        Forms\Components\Select::make('candidate_id')
                            ->label('Ung vien')
                            ->relationship('candidate', 'name')
                            ->searchable()
                            ->preload()
                            ->nullable(),
                        Forms\Components\TextInput::make('candidate_name')
                            ->label('Ten ung vien (ben ngoai)')
                            ->maxLength(255),
                        Forms\Components\TextInput::make('candidate_email')
                            ->label('Email ung vien')
                            ->email()
                            ->maxLength(255),
                        Forms\Components\TextInput::make('candidate_phone')
                            ->label('SDT ung vien')
                            ->tel()
                            ->maxLength(20),
                        Forms\Components\Select::make('source')
                            ->label('Nguon')
                            ->options([
                                'system' => 'He thong',
                                'zalo' => 'Zalo',
                                'facebook' => 'Facebook',
                                'manual' => 'Thu cong',
                                'other' => 'Khac',
                            ]),
                        Forms\Components\Select::make('status')
                            ->label('Trang thai')
                            ->options([
                                'pending' => 'Cho duyet',
                                'reviewing' => 'Dang xem xet',
                                'shortlisted' => 'Vao vong',
                                'interview' => 'Phong van',
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
                    ->label('Tin tuyen dung')
                    ->searchable()
                    ->sortable()
                    ->limit(30),
                Tables\Columns\TextColumn::make('candidate.name')
                    ->label('Ung vien')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('source')
                    ->label('Nguon')
                    ->badge()
                    ->toggleable(),
                Tables\Columns\TextColumn::make('status')
                    ->label('Trang thai')
                    ->badge()
                    ->color(fn(string $state): string => match ($state) {
                        'accepted' => 'success',
                        'rejected' => 'danger',
                        'interview', 'shortlisted' => 'warning',
                        'reviewing' => 'info',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn(string $state): string => match ($state) {
                        'pending' => 'Cho duyet',
                        'reviewing' => 'Xem xet',
                        'shortlisted' => 'Vao vong',
                        'interview' => 'Phong van',
                        'accepted' => 'Chap nhan',
                        'rejected' => 'Tu choi',
                        default => $state,
                    }),
                Tables\Columns\TextColumn::make('applied_at')
                    ->label('Ngay ung tuyen')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
                Tables\Columns\TextColumn::make('reviewed_at')
                    ->label('Ngay xem xet')
                    ->dateTime('d/m/Y H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->defaultSort('applied_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->label('Trang thai')
                    ->options([
                        'pending' => 'Cho duyet',
                        'reviewing' => 'Dang xem xet',
                        'shortlisted' => 'Vao vong',
                        'interview' => 'Phong van',
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
