<?php

namespace App\Filament\Widgets;

use App\Models\Candidate;
use Filament\Widgets\ChartWidget;

class CandidateSourceWidget extends ChartWidget
{
    protected static ?string $heading = 'Nguồn ứng viên';

    protected static ?int $sort = 5;

    protected int|string|array $columnSpan = 1;

    protected static ?string $maxHeight = '250px';

    protected function getData(): array
    {
        $sources = [
            'facebook' => 'Facebook',
            'zalo' => 'Zalo',
            'website' => 'Website',
            'referral' => 'Giới thiệu',
        ];

        $data = [];
        $labels = [];
        $colors = ['#3b82f6', '#06b6d4', '#8b5cf6', '#f59e0b'];

        foreach ($sources as $key => $label) {
            $count = Candidate::where('source', $key)->count();
            if ($count > 0) {
                $data[] = $count;
                $labels[] = $label;
            }
        }

        // Add others
        $otherCount = Candidate::whereNotIn('source', array_keys($sources))
            ->orWhereNull('source')
            ->count();
        if ($otherCount > 0) {
            $data[] = $otherCount;
            $labels[] = 'Khác';
            $colors[] = '#6b7280';
        }

        return [
            'datasets' => [
                [
                    'data' => $data,
                    'backgroundColor' => array_slice($colors, 0, count($data)),
                ],
            ],
            'labels' => $labels,
        ];
    }

    protected function getType(): string
    {
        return 'doughnut';
    }

    protected function getOptions(): array
    {
        return [
            'plugins' => [
                'legend' => [
                    'position' => 'right',
                ],
            ],
        ];
    }
}
