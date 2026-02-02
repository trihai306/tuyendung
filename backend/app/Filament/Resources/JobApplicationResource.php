<?php

namespace App\Filament\Resources;

use App\Filament\Exports\JobApplicationExport;
use App\Filament\Resources\JobApplicationResource\Pages;
use App\Filament\Resources\JobApplicationResource\RelationManagers;
use App\Models\JobApplication;
use App\Models\PipelineStage;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Maatwebsite\Excel\Facades\Excel;

class JobApplicationResource extends Resource
{
    protected static ?string $model = JobApplication::class;

    protected static ?string $navigationIcon = 'heroicon-o-document-text';

    protected static ?string $navigationGroup = 'Ứng viên';

    protected static ?string $modelLabel = 'Đơn ứng tuyển';

    protected static ?string $pluralModelLabel = 'Đơn ứng tuyển';

    protected static ?int $navigationSort = 2;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Thông tin cơ bản')
                    ->columns(2)
                    ->schema([
                        Forms\Components\Select::make('job_id')
                            ->label('Tin tuyển dụng')
                            ->relationship('job', 'title')
                            ->searchable()
                            ->preload()
                            ->required(),
                        Forms\Components\Select::make('candidate_id')
                            ->label('Ứng viên')
                            ->relationship('candidate', 'full_name')
                            ->searchable()
                            ->preload()
                            ->required(),
                        Forms\Components\Select::make('stage_id')
                            ->label('Giai đoạn')
                            ->relationship('stage', 'name')
                            ->preload()
                            ->required(),
                    ]),

                Forms\Components\Section::make('Phỏng vấn')
                    ->columns(2)
                    ->schema([
                        Forms\Components\DateTimePicker::make('interview_scheduled_at')
                            ->label('Lịch phỏng vấn'),
                        Forms\Components\TextInput::make('offer_amount')
                            ->label('Mức lương đề nghị')
                            ->numeric()
                            ->prefix('₫'),
                        Forms\Components\Textarea::make('interview_notes')
                            ->label('Ghi chú phỏng vấn')
                            ->rows(3)
                            ->columnSpanFull(),
                        Forms\Components\Textarea::make('rejection_reason')
                            ->label('Lý do từ chối')
                            ->rows(2)
                            ->columnSpanFull(),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('candidate.full_name')
                    ->label('Ứng viên')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('job.title')
                    ->label('Vị trí')
                    ->searchable()
                    ->limit(30),
                Tables\Columns\TextColumn::make('stage.name')
                    ->label('Giai đoạn')
                    ->badge()
                    ->color(fn($record) => match ($record->stage?->slug) {
                        'new' => 'gray',
                        'screening' => 'info',
                        'interview' => 'warning',
                        'offer' => 'primary',
                        'hired' => 'success',
                        'rejected' => 'danger',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('interview_scheduled_at')
                    ->label('Lịch PV')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
                Tables\Columns\TextColumn::make('stage_entered_at')
                    ->label('Ngày vào giai đoạn')
                    ->dateTime('d/m/Y')
                    ->sortable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Ngày nộp')
                    ->dateTime('d/m/Y')
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('stage_id')
                    ->label('Giai đoạn')
                    ->relationship('stage', 'name'),
                Tables\Filters\SelectFilter::make('job_id')
                    ->label('Vị trí')
                    ->relationship('job', 'title')
                    ->searchable()
                    ->preload(),
            ])
            ->actions([
                Tables\Actions\ActionGroup::make([
                    Tables\Actions\Action::make('moveStage')
                        ->label('Chuyển giai đoạn')
                        ->icon('heroicon-o-arrow-right')
                        ->form([
                            Forms\Components\Select::make('stage_id')
                                ->label('Giai đoạn mới')
                                ->options(fn() => PipelineStage::pluck('name', 'id'))
                                ->required(),
                        ])
                        ->action(function (JobApplication $record, array $data) {
                            $stage = PipelineStage::find($data['stage_id']);
                            $record->moveToStage($stage);
                        }),
                    Tables\Actions\Action::make('scheduleInterview')
                        ->label('Đặt lịch phỏng vấn')
                        ->icon('heroicon-o-calendar')
                        ->form([
                            Forms\Components\DateTimePicker::make('interview_scheduled_at')
                                ->label('Thời gian phỏng vấn')
                                ->required(),
                        ])
                        ->action(function (JobApplication $record, array $data) {
                            $record->scheduleInterview(new \DateTime($data['interview_scheduled_at']));
                        }),
                    Tables\Actions\Action::make('hire')
                        ->label('Tuyển dụng')
                        ->icon('heroicon-o-check-badge')
                        ->color('success')
                        ->form([
                            Forms\Components\TextInput::make('offer_amount')
                                ->label('Mức lương')
                                ->numeric()
                                ->prefix('₫'),
                        ])
                        ->action(fn(JobApplication $record, array $data) => $record->hire($data['offer_amount'] ?? null)),
                    Tables\Actions\Action::make('reject')
                        ->label('Từ chối')
                        ->icon('heroicon-o-x-mark')
                        ->color('danger')
                        ->form([
                            Forms\Components\Textarea::make('rejection_reason')
                                ->label('Lý do')
                                ->required(),
                        ])
                        ->action(fn(JobApplication $record, array $data) => $record->reject($data['rejection_reason'])),
                ]),
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
                    ->action(fn() => Excel::download(new JobApplicationExport, 'don-ung-tuyen-' . now()->format('Y-m-d') . '.xlsx')),
            ]);
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListJobApplications::route('/'),
            'create' => Pages\CreateJobApplication::route('/create'),
            'edit' => Pages\EditJobApplication::route('/{record}/edit'),
        ];
    }
}
