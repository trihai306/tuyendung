<?php

namespace App\Filament\Widgets;

use App\Models\JobApplication;
use App\Models\PipelineStage;
use Filament\Widgets\ChartWidget;

class PipelineFunnelWidget extends ChartWidget
{
    protected static ?string $heading = 'Phễu tuyển dụng';

    protected static ?int $sort = 3;

    protected int|string|array $columnSpan = 'full';

    protected static ?string $maxHeight = '300px';

    protected function getData(): array
    {
        $stages = PipelineStage::orderBy('sort_order')->get();
        $labels = [];
        $data = [];
        $colors = [];

        foreach ($stages as $stage) {
            $labels[] = $stage->name;
            $data[] = JobApplication::where('stage_id', $stage->id)->count();
            $colors[] = $stage->color ?? '#6366f1';
        }

        return [
            'datasets' => [
                [
                    'label' => 'Số ứng viên',
                    'data' => $data,
                    'backgroundColor' => $colors,
                    'borderRadius' => 6,
                ],
            ],
            'labels' => $labels,
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
            ],
        ];
    }
}
