<?php

namespace App\Filament\Widgets;

use App\Models\JobApplication;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;
use Illuminate\Support\Carbon;

class UpcomingInterviewsWidget extends BaseWidget
{
    protected static ?string $heading = 'Lịch phỏng vấn sắp tới';

    protected static ?int $sort = 8;

    protected int|string|array $columnSpan = 1;

    public function table(Table $table): Table
    {
        return $table
            ->query(
                JobApplication::query()
                    ->with(['candidate', 'job'])
                    ->whereNotNull('interview_scheduled_at')
                    ->where('interview_scheduled_at', '>=', Carbon::now())
                    ->whereNull('hired_at')
                    ->whereNull('rejected_at')
                    ->orderBy('interview_scheduled_at')
                    ->limit(5)
            )
            ->columns([
                Tables\Columns\TextColumn::make('candidate.full_name')
                    ->label('Ứng viên')
                    ->limit(20),
                Tables\Columns\TextColumn::make('job.title')
                    ->label('Vị trí')
                    ->limit(20),
                Tables\Columns\TextColumn::make('interview_scheduled_at')
                    ->label('Thời gian')
                    ->dateTime('d/m H:i')
                    ->badge()
                    ->color(
                        fn($record) =>
                        $record->interview_scheduled_at->isToday() ? 'danger' :
                        ($record->interview_scheduled_at->isTomorrow() ? 'warning' : 'info')
                    ),
            ])
            ->paginated(false);
    }
}
