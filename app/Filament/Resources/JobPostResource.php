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

    protected static ?string $navigationGroup = 'Tuyển dụng';

    protected static ?string $navigationLabel = 'Tin tuyển dụng';

    protected static ?string $modelLabel = 'Tin tuyển dụng';

    protected static ?string $pluralModelLabel = 'Tin tuyển dụng';

    protected static ?int $navigationSort = 2;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Thong tin co ban')
                    ->schema([
                        Forms\Components\TextInput::make('title')
                            ->label('Tiêu đề')
                            ->required()
                            ->maxLength(255),
                        Forms\Components\TextInput::make('slug')
                            ->label('Slug')
                            ->required()
                            ->maxLength(255)
                            ->unique(ignoreRecord: true),
                        Forms\Components\Select::make('employer_id')
                            ->label('Nhà tuyển dụng')
                            ->relationship('employer', 'name')
                            ->searchable()
                            ->preload()
                            ->required(),
                        Forms\Components\Select::make('category_id')
                            ->label('Danh mục')
                            ->relationship('category', 'name')
                            ->searchable()
                            ->preload()
                            ->required(),
                        Forms\Components\Select::make('job_type')
                            ->label('Loại công việc')
                            ->options([
                                'full_time' => 'Toan thoi gian',
                                'part_time' => 'Ban thoi gian',
                                'seasonal' => 'Thoi vu',
                                'office' => 'Van phong',
                                'remote' => 'Tu xa',
                            ])
                            ->required(),
                        Forms\Components\Select::make('status')
                            ->label('Trạng thái')
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

                Forms\Components\Section::make('Luong & Vi tri')
                    ->schema([
                        Forms\Components\TextInput::make('salary_min')
                            ->label('Lương tối thiểu')
                            ->numeric()
                            ->prefix('VND'),
                        Forms\Components\TextInput::make('salary_max')
                            ->label('Lương tối đa')
                            ->numeric()
                            ->prefix('VND'),
                        Forms\Components\Select::make('salary_type')
                            ->label('Hình thức trả')
                            ->options([
                                'monthly' => 'Tháng',
                                'hourly' => 'Gio',
                                'daily' => 'Ngày',
                                'project' => 'Du an',
                            ]),
                        Forms\Components\TextInput::make('location')
                            ->label('Địa chỉ')
                            ->maxLength(255),
                        Forms\Components\TextInput::make('district')
                            ->label('Quận/Huyện')
                            ->maxLength(100),
                        Forms\Components\TextInput::make('city')
                            ->label('Thành phố')
                            ->maxLength(100),
                    ])
                    ->columns(3),

                Forms\Components\Section::make('Mo ta chi tiet')
                    ->schema([
                        Forms\Components\RichEditor::make('description')
                            ->label('Mô tả công việc')
                            ->columnSpanFull(),
                        Forms\Components\RichEditor::make('requirements')
                            ->label('Yêu cầu')
                            ->columnSpanFull(),
                        Forms\Components\RichEditor::make('benefits')
                            ->label('Quyền lợi')
                            ->columnSpanFull(),
                    ]),

                Forms\Components\Section::make('Thong tin them')
                    ->schema([
                        Forms\Components\TextInput::make('slots')
                            ->label('Số lượng tuyển')
                            ->numeric()
                            ->default(1),
                        Forms\Components\DatePicker::make('deadline')
                            ->label('Hạn nộp'),
                        Forms\Components\TextInput::make('work_schedule')
                            ->label('Lịch làm việc')
                            ->maxLength(255),
                        Forms\Components\Select::make('experience_level')
                            ->label('Kinh nghiệm')
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
                    ->label('Tiêu đề')
                    ->searchable()
                    ->sortable()
                    ->limit(40),
                Tables\Columns\TextColumn::make('employer.name')
                    ->label('Nhà tuyển dụng')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('category.name')
                    ->label('Danh mục')
                    ->sortable(),
                Tables\Columns\TextColumn::make('job_type')
                    ->label('Loại')
                    ->badge(),
                Tables\Columns\TextColumn::make('status')
                    ->label('Trạng thái')
                    ->badge()
                    ->color(fn(string $state): string => match ($state) {
                        'active' => 'success',
                        'draft' => 'gray',
                        'paused' => 'warning',
                        'closed' => 'danger',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('city')
                    ->label('Thành phố')
                    ->searchable(),
                Tables\Columns\TextColumn::make('views_count')
                    ->label('Lượt xem')
                    ->sortable()
                    ->numeric(),
                Tables\Columns\TextColumn::make('deadline')
                    ->label('Hạn nộp')
                    ->date('d/m/Y')
                    ->sortable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Ngày tạo')
                    ->dateTime('d/m/Y')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->label('Trạng thái')
                    ->options([
                        'draft' => 'Nhap',
                        'active' => 'Dang tuyen',
                        'paused' => 'Tam dung',
                        'closed' => 'Da dong',
                    ]),
                Tables\Filters\SelectFilter::make('job_type')
                    ->label('Loại')
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
