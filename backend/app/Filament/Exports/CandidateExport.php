<?php

namespace App\Filament\Exports;

use App\Models\Candidate;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class CandidateExport implements FromQuery, WithHeadings, WithMapping
{
    use Exportable;

    public function query()
    {
        return Candidate::query()->with('applications');
    }

    public function headings(): array
    {
        return [
            'ID',
            'Họ và tên',
            'Email',
            'Số điện thoại',
            'Nguồn',
            'Trạng thái',
            'Số đơn ứng tuyển',
            'Ngày tạo',
        ];
    }

    public function map($candidate): array
    {
        return [
            $candidate->id,
            $candidate->full_name,
            $candidate->email,
            $candidate->phone,
            $candidate->source,
            $candidate->status,
            $candidate->applications->count(),
            $candidate->created_at->format('d/m/Y H:i'),
        ];
    }
}
