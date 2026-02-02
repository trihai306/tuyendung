<?php

namespace App\Filament\Resources;

use App\Filament\Resources\PostTemplateResource\Pages;
use App\Models\PostTemplate;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class PostTemplateResource extends Resource
{
    protected static ?string $model = PostTemplate::class;

    protected static ?string $navigationIcon = 'heroicon-o-document-text';

    protected static ?string $navigationGroup = 'Marketing';

    protected static ?string $modelLabel = 'Template bài đăng';

    protected static ?string $pluralModelLabel = 'Template bài đăng';

    protected static ?int $navigationSort = 2;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Thông tin template')
                    ->columns(2)
                    ->schema([
                        Forms\Components\TextInput::make('name')
                            ->label('Tên template')
                            ->required()
                            ->maxLength(255),
                        Forms\Components\Select::make('platform')
                            ->label('Nền tảng')
                            ->options([
                                'facebook' => 'Facebook',
                                'zalo' => 'Zalo',
                                'all' => 'Tất cả',
                            ])
                            ->default('all')
                            ->required(),
                        Forms\Components\Select::make('company_id')
                            ->label('Công ty')
                            ->relationship('company', 'name')
                            ->searchable()
                            ->preload()
                            ->nullable(),
                        Forms\Components\Select::make('cta_type')
                            ->label('Loại CTA')
                            ->options([
                                'apply' => 'Ứng tuyển ngay',
                                'learn_more' => 'Tìm hiểu thêm',
                                'contact' => 'Liên hệ',
                                'none' => 'Không có',
                            ])
                            ->default('apply'),
                    ]),

                Forms\Components\Section::make('Nội dung template')
                    ->schema([
                        Forms\Components\Textarea::make('content_template')
                            ->label('Nội dung')
                            ->required()
                            ->rows(10)
                            ->helperText('Biến khả dụng: {job_title}, {company_name}, {location}, {salary_min}, {salary_max}, {salary_range}, {job_type}, {experience}, {deadline}, {requirements}, {benefits}, {description}'),
                        Forms\Components\FileUpload::make('media_urls')
                            ->label('Hình ảnh mặc định')
                            ->multiple()
                            ->image()
                            ->directory('templates'),
                        Forms\Components\TextInput::make('cta_url')
                            ->label('URL CTA')
                            ->url()
                            ->placeholder('https://...'),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->label('Tên template')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\BadgeColumn::make('platform')
                    ->label('Nền tảng')
                    ->formatStateUsing(fn(string $state): string => match ($state) {
                        'facebook' => 'Facebook',
                        'zalo' => 'Zalo',
                        'all' => 'Tất cả',
                        default => $state,
                    })
                    ->colors([
                        'primary' => 'facebook',
                        'success' => 'zalo',
                        'gray' => 'all',
                    ]),
                Tables\Columns\TextColumn::make('company.name')
                    ->label('Công ty')
                    ->placeholder('Chung'),
                Tables\Columns\TextColumn::make('scheduled_posts_count')
                    ->label('Lượt dùng')
                    ->counts('scheduledPosts'),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Ngày tạo')
                    ->dateTime('d/m/Y'),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('platform')
                    ->label('Nền tảng')
                    ->options([
                        'facebook' => 'Facebook',
                        'zalo' => 'Zalo',
                        'all' => 'Tất cả',
                    ]),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\Action::make('duplicate')
                    ->label('Nhân bản')
                    ->icon('heroicon-o-document-duplicate')
                    ->action(function ($record) {
                        $new = $record->replicate();
                        $new->name = $record->name . ' (Copy)';
                        $new->save();
                    }),
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
            'index' => Pages\ListPostTemplates::route('/'),
            'create' => Pages\CreatePostTemplate::route('/create'),
            'edit' => Pages\EditPostTemplate::route('/{record}/edit'),
        ];
    }
}
