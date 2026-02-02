<?php

namespace App\Filament\Widgets;

use App\Models\JobApplication;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Carbon;

class ApplicationTrendWidget extends ChartWidget
{
    protected static ?string $heading = 'Xu hướng ứng tuyển (30 ngày)';

    protected static ?int $sort = 4;

    protected int|string|array $columnSpan = 1;

    protected static ?string $maxHeight = '250px';

    protected function getData(): array
    {
        $days = collect();
        $data = collect();

        for ($i = 29; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $days->push($date->format('d/m'));
            $data->push(
                JobApplication::whereDate('created_at', $date)->count()
            );
        }

        return [
            'datasets' => [
                [
                    'label' => 'Đơn ứng tuyển',
                    'data' => $data->toArray(),
                    'borderColor' => '#10b981',
                    'backgroundColor' => 'rgba(16, 185, 129, 0.1)',
                    'fill' => true,
                    'tension' => 0.4,
                ],
            ],
            'labels' => $days->toArray(),
        ];
    }

    protected function getType(): string
    {
        return 'line';
    }

    protected function getOptions(): array
    {
        return [
            'plugins' => [
                'legend' => [
                    'display' => false,
                ],
            ],
            'scales' => [
                'y' => [
                    'beginAtZero' => true,
                    'ticks' => [
                        'stepSize' => 1,
                    ],
                ],
                'x' => [
                    'ticks' => [
                        'maxTicksLimit' => 10,
                    ],
                ],
            ],
        ];
    }
}
