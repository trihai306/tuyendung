<?php

namespace App\Filament\Widgets;

use App\Models\JobApplication;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;

class RecentApplicationsWidget extends BaseWidget
{
    protected static ?int $sort = 2;

    protected int|string|array $columnSpan = 'full';

    protected static ?string $heading = 'Đơn ứng tuyển gần đây';

    public function table(Table $table): Table
    {
        return $table
            ->query(
                JobApplication::query()
                    ->with(['candidate', 'job', 'stage'])
                    ->latest()
                    ->limit(5)
            )
            ->columns([
                Tables\Columns\TextColumn::make('candidate.full_name')
                    ->label('Ứng viên')
                    ->searchable(),
                Tables\Columns\TextColumn::make('job.title')
                    ->label('Vị trí')
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
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Ngày nộp')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
            ])
            ->paginated(false);
    }
}
