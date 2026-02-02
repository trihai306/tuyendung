<?php

namespace App\Filament\Widgets;

use App\Models\JobApplication;
use App\Models\RecruitmentJob;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;

class TopJobsWidget extends BaseWidget
{
    protected static ?string $heading = 'Top vị trí tuyển dụng';

    protected static ?int $sort = 7;

    protected int|string|array $columnSpan = 1;

    public function table(Table $table): Table
    {
        return $table
            ->query(
                RecruitmentJob::query()
                    ->withCount('applications')
                    ->where('status', 'open')
                    ->orderByDesc('applications_count')
                    ->limit(5)
            )
            ->columns([
                Tables\Columns\TextColumn::make('title')
                    ->label('Vị trí')
                    ->limit(25)
                    ->searchable(),
                Tables\Columns\TextColumn::make('applications_count')
                    ->label('Hồ sơ')
                    ->badge()
                    ->color('success'),
                Tables\Columns\TextColumn::make('department')
                    ->label('Phòng ban')
                    ->limit(15),
            ])
            ->paginated(false);
    }
}
