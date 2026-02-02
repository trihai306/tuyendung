<?php

namespace App\Filament\Exports;

use App\Models\JobApplication;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class JobApplicationExport implements FromQuery, WithHeadings, WithMapping
{
    use Exportable;

    public function query()
    {
        return JobApplication::query()->with(['candidate', 'job', 'stage']);
    }

    public function headings(): array
    {
        return [
            'ID',
            'Ứng viên',
            'Email ứng viên',
            'SĐT ứng viên',
            'Vị trí ứng tuyển',
            'Giai đoạn',
            'Lịch phỏng vấn',
            'Ngày tuyển',
            'Ngày từ chối',
            'Ngày nộp đơn',
        ];
    }

    public function map($application): array
    {
        return [
            $application->id,
            $application->candidate?->full_name,
            $application->candidate?->email,
            $application->candidate?->phone,
            $application->job?->title,
            $application->stage?->name,
            $application->interview_scheduled_at?->format('d/m/Y H:i'),
            $application->hired_at?->format('d/m/Y'),
            $application->rejected_at?->format('d/m/Y'),
            $application->created_at->format('d/m/Y H:i'),
        ];
    }
}
