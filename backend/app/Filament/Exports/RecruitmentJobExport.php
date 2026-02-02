<?php

namespace App\Filament\Exports;

use App\Models\RecruitmentJob;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class RecruitmentJobExport implements FromQuery, WithHeadings, WithMapping
{
    use Exportable;

    public function query()
    {
        return RecruitmentJob::query()->withCount('applications');
    }

    public function headings(): array
    {
        return [
            'ID',
            'Tiêu đề',
            'Phòng ban',
            'Địa điểm',
            'Loại công việc',
            'Mức lương',
            'Trạng thái',
            'Số đơn ứng tuyển',
            'Ngày đăng',
            'Ngày hết hạn',
        ];
    }

    public function map($job): array
    {
        return [
            $job->id,
            $job->title,
            $job->department,
            $job->location,
            $job->job_type,
            $job->salary_range,
            $job->status,
            $job->applications_count,
            $job->published_at?->format('d/m/Y'),
            $job->expired_at?->format('d/m/Y'),
        ];
    }
}
