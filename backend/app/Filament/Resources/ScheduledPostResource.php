<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ScheduledPostResource\Pages;
use App\Jobs\PublishScheduledPostJob;
use App\Models\ScheduledPost;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Notifications\Notification;

class ScheduledPostResource extends Resource
{
    protected static ?string $model = ScheduledPost::class;

    protected static ?string $navigationIcon = 'heroicon-o-megaphone';

    protected static ?string $navigationGroup = 'Marketing';

    protected static ?string $modelLabel = 'Bài đăng';

    protected static ?string $pluralModelLabel = 'Bài đăng MXH';

    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Nội dung bài đăng')
                    ->columns(2)
                    ->schema([
                        Forms\Components\Select::make('job_id')
                            ->label('Tin tuyển dụng')
                            ->relationship('job', 'title')
                            ->searchable()
                            ->preload()
                            ->required(),
                        Forms\Components\Select::make('platform_account_id')
                            ->label('Tài khoản MXH')
                            ->relationship('platformAccount', 'name')
                            ->searchable()
                            ->preload()
                            ->required(),
                        Forms\Components\Select::make('template_id')
                            ->label('Template')
                            ->relationship('template', 'name')
                            ->searchable()
                            ->preload()
                            ->reactive()
                            ->afterStateUpdated(function ($state, Forms\Set $set, Forms\Get $get) {
                                if ($state && $get('job_id')) {
                                    $template = \App\Models\PostTemplate::find($state);
                                    $job = \App\Models\RecruitmentJob::find($get('job_id'));
                                    if ($template && $job) {
                                        $set('content', $template->parseContent($job));
                                    }
                                }
                            }),
                        Forms\Components\DateTimePicker::make('scheduled_at')
                            ->label('Thời gian đăng')
                            ->required()
                            ->default(now()->addHour())
                            ->minDate(now()),
                        Forms\Components\RichEditor::make('content')
                            ->label('Nội dung')
                            ->required()
                            ->columnSpanFull(),
                        Forms\Components\FileUpload::make('media_urls')
                            ->label('Hình ảnh')
                            ->multiple()
                            ->image()
                            ->directory('posts')
                            ->columnSpanFull(),
                    ]),

                Forms\Components\Section::make('Trạng thái')
                    ->columns(2)
                    ->schema([
                        Forms\Components\Select::make('status')
                            ->label('Trạng thái')
                            ->options([
                                'pending' => 'Chờ duyệt',
                                'approved' => 'Đã duyệt',
                                'cancelled' => 'Đã hủy',
                            ])
                            ->default('pending')
                            ->required(),
                        Forms\Components\Placeholder::make('published_at')
                            ->label('Thời gian đăng thực')
                            ->content(fn($record) => $record?->published_at?->format('d/m/Y H:i') ?? '-'),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('job.title')
                    ->label('Tin tuyển dụng')
                    ->limit(30)
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('platformAccount.name')
                    ->label('Tài khoản')
                    ->searchable(),
                Tables\Columns\BadgeColumn::make('platformAccount.platform')
                    ->label('Nền tảng')
                    ->colors([
                        'primary' => 'facebook',
                        'success' => 'zalo',
                    ]),
                Tables\Columns\TextColumn::make('scheduled_at')
                    ->label('Lên lịch')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
                Tables\Columns\BadgeColumn::make('status')
                    ->label('Trạng thái')
                    ->formatStateUsing(fn(string $state): string => match ($state) {
                        'pending' => 'Chờ duyệt',
                        'approved' => 'Đã duyệt',
                        'published' => 'Đã đăng',
                        'failed' => 'Lỗi',
                        'cancelled' => 'Đã hủy',
                        default => $state,
                    })
                    ->colors([
                        'warning' => 'pending',
                        'info' => 'approved',
                        'success' => 'published',
                        'danger' => 'failed',
                        'gray' => 'cancelled',
                    ]),
                Tables\Columns\TextColumn::make('published_at')
                    ->label('Đã đăng lúc')
                    ->dateTime('d/m/Y H:i')
                    ->placeholder('-'),
                Tables\Columns\TextColumn::make('createdBy.name')
                    ->label('Người tạo'),
            ])
            ->defaultSort('scheduled_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->label('Trạng thái')
                    ->options([
                        'pending' => 'Chờ duyệt',
                        'approved' => 'Đã duyệt',
                        'published' => 'Đã đăng',
                        'failed' => 'Lỗi',
                    ]),
                Tables\Filters\SelectFilter::make('platformAccount.platform')
                    ->label('Nền tảng')
                    ->options([
                        'facebook' => 'Facebook',
                        'zalo' => 'Zalo',
                    ]),
            ])
            ->actions([
                Tables\Actions\Action::make('approve')
                    ->label('Duyệt')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->visible(fn($record) => $record->status === 'pending')
                    ->requiresConfirmation()
                    ->action(function ($record) {
                        $record->update([
                            'status' => 'approved',
                            'approved_by' => auth()->id(),
                            'approved_at' => now(),
                        ]);
                        Notification::make()
                            ->title('Đã duyệt bài đăng')
                            ->success()
                            ->send();
                    }),
                Tables\Actions\Action::make('publish_now')
                    ->label('Đăng ngay')
                    ->icon('heroicon-o-paper-airplane')
                    ->color('primary')
                    ->visible(fn($record) => $record->status === 'approved')
                    ->requiresConfirmation()
                    ->modalDescription('Bài đăng sẽ được đưa vào hàng đợi và đăng trong vài phút')
                    ->action(function ($record) {
                        PublishScheduledPostJob::dispatch($record);
                        Notification::make()
                            ->title('Đã đưa vào hàng đợi đăng bài')
                            ->success()
                            ->send();
                    }),
                Tables\Actions\Action::make('retry')
                    ->label('Thử lại')
                    ->icon('heroicon-o-arrow-path')
                    ->color('warning')
                    ->visible(fn($record) => $record->status === 'failed')
                    ->requiresConfirmation()
                    ->action(function ($record) {
                        $record->update(['status' => 'approved', 'error_message' => null]);
                        PublishScheduledPostJob::dispatch($record);
                        Notification::make()
                            ->title('Đang thử đăng lại')
                            ->success()
                            ->send();
                    }),
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\BulkAction::make('approve_selected')
                        ->label('Duyệt đã chọn')
                        ->icon('heroicon-o-check')
                        ->action(function ($records) {
                            $records->each(fn($r) => $r->update([
                                'status' => 'approved',
                                'approved_by' => auth()->id(),
                                'approved_at' => now(),
                            ]));
                        }),
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
            'index' => Pages\ListScheduledPosts::route('/'),
            'create' => Pages\CreateScheduledPost::route('/create'),
            'edit' => Pages\EditScheduledPost::route('/{record}/edit'),
        ];
    }
}
