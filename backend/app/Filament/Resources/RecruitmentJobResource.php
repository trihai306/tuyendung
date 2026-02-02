<?php

namespace App\Filament\Resources;

use App\Filament\Exports\RecruitmentJobExport;
use App\Filament\Resources\RecruitmentJobResource\Pages;
use App\Filament\Resources\RecruitmentJobResource\RelationManagers;
use App\Models\RecruitmentJob;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Maatwebsite\Excel\Facades\Excel;

class RecruitmentJobResource extends Resource
{
    protected static ?string $model = RecruitmentJob::class;

    protected static ?string $navigationIcon = 'heroicon-o-briefcase';

    protected static ?string $navigationGroup = 'Tuyển dụng';

    protected static ?string $modelLabel = 'Tin tuyển dụng';

    protected static ?string $pluralModelLabel = 'Tin tuyển dụng';

    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Thông tin cơ bản')
                    ->columns(2)
                    ->schema([
                        Forms\Components\TextInput::make('title')
                            ->label('Tiêu đề')
                            ->required()
                            ->maxLength(255),
                        Forms\Components\TextInput::make('department')
                            ->label('Phòng ban')
                            ->maxLength(255),
                        Forms\Components\TextInput::make('location')
                            ->label('Địa điểm')
                            ->maxLength(255),
                        Forms\Components\Select::make('job_type')
                            ->label('Loại hình')
                            ->options([
                                'full-time' => 'Toàn thời gian',
                                'part-time' => 'Bán thời gian',
                                'contract' => 'Hợp đồng',
                                'intern' => 'Thực tập',
                            ]),
                        Forms\Components\Select::make('status')
                            ->label('Trạng thái')
                            ->options([
                                'draft' => 'Bản nháp',
                                'open' => 'Đang tuyển',
                                'paused' => 'Tạm dừng',
                                'closed' => 'Đã đóng',
                            ])
                            ->default('draft')
                            ->required(),
                    ]),

                Forms\Components\Section::make('Mức lương')
                    ->columns(3)
                    ->schema([
                        Forms\Components\TextInput::make('salary_min')
                            ->label('Lương tối thiểu')
                            ->numeric()
                            ->prefix('₫'),
                        Forms\Components\TextInput::make('salary_max')
                            ->label('Lương tối đa')
                            ->numeric()
                            ->prefix('₫'),
                        Forms\Components\Select::make('salary_currency')
                            ->label('Đơn vị')
                            ->options([
                                'VND' => 'VND',
                                'USD' => 'USD',
                            ])
                            ->default('VND'),
                    ]),

                Forms\Components\Section::make('Mô tả chi tiết')
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

                Forms\Components\Section::make('Thời gian')
                    ->columns(2)
                    ->schema([
                        Forms\Components\DateTimePicker::make('published_at')
                            ->label('Ngày đăng'),
                        Forms\Components\DateTimePicker::make('expires_at')
                            ->label('Ngày hết hạn'),
                        Forms\Components\TextInput::make('target_count')
                            ->label('Số lượng cần tuyển')
                            ->numeric()
                            ->default(1),
                        Forms\Components\TextInput::make('hired_count')
                            ->label('Đã tuyển')
                            ->numeric()
                            ->default(0)
                            ->disabled(),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('title')
                    ->label('Tiêu đề')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('department')
                    ->label('Phòng ban')
                    ->searchable(),
                Tables\Columns\TextColumn::make('location')
                    ->label('Địa điểm'),
                Tables\Columns\BadgeColumn::make('status')
                    ->label('Trạng thái')
                    ->colors([
                        'secondary' => 'draft',
                        'success' => 'open',
                        'warning' => 'paused',
                        'danger' => 'closed',
                    ]),
                Tables\Columns\TextColumn::make('applications_count')
                    ->label('Hồ sơ')
                    ->counts('applications'),
                Tables\Columns\TextColumn::make('salary_range')
                    ->label('Mức lương'),
                Tables\Columns\TextColumn::make('published_at')
                    ->label('Ngày đăng')
                    ->dateTime('d/m/Y')
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->label('Trạng thái')
                    ->options([
                        'draft' => 'Bản nháp',
                        'open' => 'Đang tuyển',
                        'paused' => 'Tạm dừng',
                        'closed' => 'Đã đóng',
                    ]),
                Tables\Filters\SelectFilter::make('job_type')
                    ->label('Loại hình')
                    ->options([
                        'full-time' => 'Toàn thời gian',
                        'part-time' => 'Bán thời gian',
                        'contract' => 'Hợp đồng',
                        'intern' => 'Thực tập',
                    ]),
            ])
            ->actions([
                Tables\Actions\Action::make('publish')
                    ->label('Đăng tin')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->action(fn(RecruitmentJob $record) => $record->publish())
                    ->visible(fn(RecruitmentJob $record) => $record->status === 'draft'),
                Tables\Actions\Action::make('close')
                    ->label('Đóng tin')
                    ->icon('heroicon-o-x-circle')
                    ->color('danger')
                    ->action(fn(RecruitmentJob $record) => $record->close())
                    ->visible(fn(RecruitmentJob $record) => in_array($record->status, ['open', 'paused'])),
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ])
            ->headerActions([
                Tables\Actions\Action::make('export')
                    ->label('Xuất Excel')
                    ->icon('heroicon-o-arrow-down-tray')
                    ->action(fn() => Excel::download(new RecruitmentJobExport, 'tin-tuyen-dung-' . now()->format('Y-m-d') . '.xlsx')),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            // RelationManagers will be added after creation
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListRecruitmentJobs::route('/'),
            'create' => Pages\CreateRecruitmentJob::route('/create'),
            'edit' => Pages\EditRecruitmentJob::route('/{record}/edit'),
        ];
    }
}
