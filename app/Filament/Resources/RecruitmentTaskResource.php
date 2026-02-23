<?php

declare(strict_types=1);

namespace App\Filament\Resources;

use App\Filament\Resources\RecruitmentTaskResource\Pages;
use App\Models\RecruitmentTask;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class RecruitmentTaskResource extends Resource
{
    protected static ?string $model = RecruitmentTask::class;

    protected static ?string $navigationIcon = 'heroicon-o-clipboard-document-list';

    protected static ?string $navigationGroup = 'Doi nhom';

    protected static ?string $navigationLabel = 'Nhiem vu tuyen dung';

    protected static ?string $modelLabel = 'Nhiem vu';

    protected static ?string $pluralModelLabel = 'Nhiem vu tuyen dung';

    protected static ?int $navigationSort = 2;

    public static function getNavigationBadge(): ?string
    {
        return (string) static::getModel()::whereIn('status', ['pending', 'in_progress'])->count();
    }

    public static function getNavigationBadgeColor(): string|array|null
    {
        $count = static::getModel()::whereIn('status', ['pending', 'in_progress'])->count();
        return $count > 5 ? 'danger' : 'warning';
    }

    public static function getGloballySearchableAttributes(): array
    {
        return ['title', 'assignee.name', 'jobPost.title'];
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Thong tin nhiem vu')
                    ->schema([
                        Forms\Components\TextInput::make('title')
                            ->label('Tieu de')
                            ->required()
                            ->maxLength(255),
                        Forms\Components\Select::make('employer_profile_id')
                            ->label('Cong ty')
                            ->relationship('employerProfile', 'company_name')
                            ->searchable()
                            ->preload()
                            ->required(),
                        Forms\Components\Select::make('job_post_id')
                            ->label('Tin tuyen dung')
                            ->relationship('jobPost', 'title')
                            ->searchable()
                            ->preload()
                            ->nullable(),
                        Forms\Components\Select::make('type')
                            ->label('Loai nhiem vu')
                            ->options([
                                'source_candidates' => 'Tim ung vien',
                                'screen_applications' => 'Loc ho so',
                                'schedule_interviews' => 'Len lich phong van',
                                'post_job' => 'Dang tin tuyen dung',
                                'other' => 'Khac',
                            ])
                            ->required(),
                        Forms\Components\Select::make('priority')
                            ->label('Do uu tien')
                            ->options([
                                'low' => 'Thap',
                                'medium' => 'Trung binh',
                                'high' => 'Cao',
                                'urgent' => 'Khan cap',
                            ])
                            ->default('medium')
                            ->required(),
                        Forms\Components\Select::make('status')
                            ->label('Trang thai')
                            ->options([
                                'pending' => 'Cho xu ly',
                                'in_progress' => 'Dang thuc hien',
                                'completed' => 'Hoan thanh',
                                'cancelled' => 'Da huy',
                            ])
                            ->default('pending')
                            ->required(),
                    ])
                    ->columns(2),

                Forms\Components\Section::make('Phan cong')
                    ->schema([
                        Forms\Components\Select::make('assigned_to')
                            ->label('Nguoi thuc hien')
                            ->relationship('assignee', 'name')
                            ->searchable()
                            ->preload()
                            ->required(),
                        Forms\Components\Select::make('assigned_by')
                            ->label('Nguoi giao')
                            ->relationship('assigner', 'name')
                            ->searchable()
                            ->preload()
                            ->nullable(),
                        Forms\Components\TextInput::make('target_quantity')
                            ->label('So luong muc tieu')
                            ->numeric()
                            ->nullable(),
                        Forms\Components\DatePicker::make('due_date')
                            ->label('Han hoan thanh'),
                        Forms\Components\DateTimePicker::make('completed_at')
                            ->label('Ngay hoan thanh'),
                    ])
                    ->columns(2),

                Forms\Components\Section::make('Chi tiet')
                    ->schema([
                        Forms\Components\Textarea::make('description')
                            ->label('Mo ta')
                            ->columnSpanFull(),
                        Forms\Components\Textarea::make('notes')
                            ->label('Ghi chu')
                            ->columnSpanFull(),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('title')
                    ->label('Tieu de')
                    ->searchable()
                    ->sortable()
                    ->limit(40),
                Tables\Columns\TextColumn::make('jobPost.title')
                    ->label('Tin tuyen dung')
                    ->searchable()
                    ->sortable()
                    ->limit(30)
                    ->toggleable(),
                Tables\Columns\TextColumn::make('assignee.name')
                    ->label('Nguoi thuc hien')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('type')
                    ->label('Loai')
                    ->badge()
                    ->formatStateUsing(fn(string $state): string => match ($state) {
                        'source_candidates' => 'Tim UV',
                        'screen_applications' => 'Loc HS',
                        'schedule_interviews' => 'Phong van',
                        'post_job' => 'Dang tin',
                        'other' => 'Khac',
                        default => $state,
                    }),
                Tables\Columns\TextColumn::make('priority')
                    ->label('Uu tien')
                    ->badge()
                    ->color(fn(string $state): string => match ($state) {
                        'urgent' => 'danger',
                        'high' => 'warning',
                        'medium' => 'info',
                        'low' => 'gray',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn(string $state): string => match ($state) {
                        'urgent' => 'Khan cap',
                        'high' => 'Cao',
                        'medium' => 'TB',
                        'low' => 'Thap',
                        default => $state,
                    }),
                Tables\Columns\TextColumn::make('status')
                    ->label('Trang thai')
                    ->badge()
                    ->color(fn(string $state): string => match ($state) {
                        'completed' => 'success',
                        'in_progress' => 'info',
                        'pending' => 'warning',
                        'cancelled' => 'danger',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn(string $state): string => match ($state) {
                        'pending' => 'Cho xu ly',
                        'in_progress' => 'Dang lam',
                        'completed' => 'Xong',
                        'cancelled' => 'Da huy',
                        default => $state,
                    }),
                Tables\Columns\TextColumn::make('due_date')
                    ->label('Han')
                    ->date('d/m/Y')
                    ->sortable()
                    ->color(
                        fn($record): string => $record->due_date && $record->due_date->isPast() && !in_array($record->status, ['completed', 'cancelled'])
                        ? 'danger'
                        : 'gray'
                    ),
                Tables\Columns\TextColumn::make('target_quantity')
                    ->label('Muc tieu')
                    ->numeric()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->label('Trang thai')
                    ->options([
                        'pending' => 'Cho xu ly',
                        'in_progress' => 'Dang thuc hien',
                        'completed' => 'Hoan thanh',
                        'cancelled' => 'Da huy',
                    ]),
                Tables\Filters\SelectFilter::make('priority')
                    ->label('Uu tien')
                    ->options([
                        'urgent' => 'Khan cap',
                        'high' => 'Cao',
                        'medium' => 'Trung binh',
                        'low' => 'Thap',
                    ]),
                Tables\Filters\SelectFilter::make('type')
                    ->label('Loai')
                    ->options([
                        'source_candidates' => 'Tim ung vien',
                        'screen_applications' => 'Loc ho so',
                        'schedule_interviews' => 'Phong van',
                        'post_job' => 'Dang tin',
                        'other' => 'Khac',
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
            'index' => Pages\ListRecruitmentTasks::route('/'),
            'create' => Pages\CreateRecruitmentTask::route('/create'),
            'edit' => Pages\EditRecruitmentTask::route('/{record}/edit'),
        ];
    }
}
