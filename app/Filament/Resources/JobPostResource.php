<?php

declare(strict_types=1);

namespace App\Filament\Resources;

use App\Filament\Resources\JobPostResource\Pages;
use App\Models\JobPost;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class JobPostResource extends Resource
{
    protected static ?string $model = JobPost::class;

    protected static ?string $navigationIcon = 'heroicon-o-briefcase';

    protected static ?string $navigationGroup = 'Tuyen dung';

    protected static ?string $navigationLabel = 'Tin tuyen dung';

    protected static ?string $modelLabel = 'Tin tuyen dung';

    protected static ?string $pluralModelLabel = 'Tin tuyen dung';

    protected static ?int $navigationSort = 2;

    public static function getNavigationBadge(): ?string
    {
        return (string) static::getModel()::where('status', 'active')->count();
    }

    public static function getNavigationBadgeColor(): string|array|null
    {
        return 'success';
    }

    public static function getGloballySearchableAttributes(): array
    {
        return ['title', 'city', 'employer.name'];
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Thong tin co ban')
                    ->schema([
                        Forms\Components\TextInput::make('title')
                            ->label('Tieu de')
                            ->required()
                            ->maxLength(255),
                        Forms\Components\TextInput::make('slug')
                            ->label('Slug')
                            ->required()
                            ->maxLength(255)
                            ->unique(ignoreRecord: true),
                        Forms\Components\Select::make('employer_id')
                            ->label('Nha tuyen dung')
                            ->relationship('employer', 'name')
                            ->searchable()
                            ->preload()
                            ->required(),
                        Forms\Components\Select::make('category_id')
                            ->label('Danh muc')
                            ->relationship('category', 'name')
                            ->searchable()
                            ->preload()
                            ->required(),
                        Forms\Components\Select::make('job_type')
                            ->label('Loai cong viec')
                            ->options([
                                'full_time' => 'Toan thoi gian',
                                'part_time' => 'Ban thoi gian',
                                'seasonal' => 'Thoi vu',
                                'office' => 'Van phong',
                                'remote' => 'Tu xa',
                            ])
                            ->required(),
                        Forms\Components\Select::make('status')
                            ->label('Trang thai')
                            ->options([
                                'draft' => 'Nhap',
                                'active' => 'Dang tuyen',
                                'paused' => 'Tam dung',
                                'closed' => 'Da dong',
                            ])
                            ->default('draft')
                            ->required(),
                    ])
                    ->columns(2),

                Forms\Components\Section::make('Luong va vi tri')
                    ->schema([
                        Forms\Components\TextInput::make('salary_min')
                            ->label('Luong toi thieu')
                            ->numeric()
                            ->prefix('VND'),
                        Forms\Components\TextInput::make('salary_max')
                            ->label('Luong toi da')
                            ->numeric()
                            ->prefix('VND'),
                        Forms\Components\Select::make('salary_type')
                            ->label('Hinh thuc tra')
                            ->options([
                                'monthly' => 'Thang',
                                'hourly' => 'Gio',
                                'daily' => 'Ngay',
                                'project' => 'Du an',
                            ]),
                        Forms\Components\TextInput::make('location')
                            ->label('Dia chi')
                            ->maxLength(255),
                        Forms\Components\TextInput::make('district')
                            ->label('Quan/Huyen')
                            ->maxLength(100),
                        Forms\Components\TextInput::make('city')
                            ->label('Thanh pho')
                            ->maxLength(100),
                    ])
                    ->columns(3),

                Forms\Components\Section::make('Mo ta chi tiet')
                    ->schema([
                        Forms\Components\RichEditor::make('description')
                            ->label('Mo ta cong viec')
                            ->columnSpanFull(),
                        Forms\Components\RichEditor::make('requirements')
                            ->label('Yeu cau')
                            ->columnSpanFull(),
                        Forms\Components\RichEditor::make('benefits')
                            ->label('Quyen loi')
                            ->columnSpanFull(),
                    ]),

                Forms\Components\Section::make('Thong tin them')
                    ->schema([
                        Forms\Components\TextInput::make('slots')
                            ->label('So luong tuyen')
                            ->numeric()
                            ->default(1),
                        Forms\Components\DatePicker::make('deadline')
                            ->label('Han nop'),
                        Forms\Components\TextInput::make('work_schedule')
                            ->label('Lich lam viec')
                            ->maxLength(255),
                        Forms\Components\Select::make('experience_level')
                            ->label('Kinh nghiem')
                            ->options([
                                'no_experience' => 'Khong yeu cau',
                                'fresher' => 'Fresher',
                                'junior' => 'Junior',
                                'mid' => 'Mid-level',
                                'senior' => 'Senior',
                            ]),
                    ])
                    ->columns(2),
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
                Tables\Columns\TextColumn::make('employer.name')
                    ->label('Nha tuyen dung')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('category.name')
                    ->label('Danh muc')
                    ->sortable(),
                Tables\Columns\TextColumn::make('job_type')
                    ->label('Loai')
                    ->badge(),
                Tables\Columns\TextColumn::make('status')
                    ->label('Trang thai')
                    ->badge()
                    ->color(fn(string $state): string => match ($state) {
                        'active' => 'success',
                        'draft' => 'gray',
                        'paused' => 'warning',
                        'closed' => 'danger',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('city')
                    ->label('Thanh pho')
                    ->searchable(),
                Tables\Columns\TextColumn::make('views_count')
                    ->label('Luot xem')
                    ->sortable()
                    ->numeric(),
                Tables\Columns\TextColumn::make('deadline')
                    ->label('Han nop')
                    ->date('d/m/Y')
                    ->sortable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Ngay tao')
                    ->dateTime('d/m/Y')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->label('Trang thai')
                    ->options([
                        'draft' => 'Nhap',
                        'active' => 'Dang tuyen',
                        'paused' => 'Tam dung',
                        'closed' => 'Da dong',
                    ]),
                Tables\Filters\SelectFilter::make('job_type')
                    ->label('Loai')
                    ->options([
                        'full_time' => 'Toan thoi gian',
                        'part_time' => 'Ban thoi gian',
                        'seasonal' => 'Thoi vu',
                        'office' => 'Van phong',
                        'remote' => 'Tu xa',
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
            'index' => Pages\ListJobPosts::route('/'),
            'create' => Pages\CreateJobPost::route('/create'),
            'edit' => Pages\EditJobPost::route('/{record}/edit'),
        ];
    }
}
