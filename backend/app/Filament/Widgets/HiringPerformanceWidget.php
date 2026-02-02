<?php

namespace App\Filament\Widgets;

use App\Models\JobApplication;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Carbon;

class HiringPerformanceWidget extends ChartWidget
{
    protected static ?string $heading = 'Hiệu suất tuyển dụng (6 tháng)';

    protected static ?int $sort = 6;

    protected int|string|array $columnSpan = 1;

    protected static ?string $maxHeight = '250px';

    protected function getData(): array
    {
        $months = collect();
        $hired = collect();
        $rejected = collect();

        for ($i = 5; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $months->push($date->format('m/Y'));

            $hired->push(
                JobApplication::whereNotNull('hired_at')
                    ->whereYear('hired_at', $date->year)
                    ->whereMonth('hired_at', $date->month)
                    ->count()
            );

            $rejected->push(
                JobApplication::whereNotNull('rejected_at')
                    ->whereYear('rejected_at', $date->year)
                    ->whereMonth('rejected_at', $date->month)
                    ->count()
            );
        }

        return [
            'datasets' => [
                [
                    'label' => 'Đã tuyển',
                    'data' => $hired->toArray(),
                    'backgroundColor' => '#10b981',
                    'borderRadius' => 4,
                ],
                [
                    'label' => 'Từ chối',
                    'data' => $rejected->toArray(),
                    'backgroundColor' => '#ef4444',
                    'borderRadius' => 4,
                ],
            ],
            'labels' => $months->toArray(),
        ];
    }

    protected function getType(): string
    {
        return 'bar';
    }

    protected function getOptions(): array
    {
        return [
            'plugins' => [
                'legend' => [
                    'position' => 'bottom',
                ],
            ],
            'scales' => [
                'y' => [
                    'beginAtZero' => true,
                    'ticks' => [
                        'stepSize' => 1,
                    ],
                ],
            ],
        ];
    }
}
