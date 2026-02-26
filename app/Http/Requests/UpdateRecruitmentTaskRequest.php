<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRecruitmentTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['sometimes', 'in:pending,in_progress,completed,cancelled'],
            'priority' => ['sometimes', 'in:low,medium,high,urgent'],
            'due_date' => ['nullable', 'date'],
            'notes' => ['nullable', 'string', 'max:5000'],
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'assigned_to' => ['sometimes', 'array', 'min:1'],
            'assigned_to.*' => ['integer', 'exists:users,id'],
            'completion_report' => ['nullable', 'string', 'max:10000'],
            'type' => ['sometimes', 'in:chinh_thuc,thoi_vu'],
            'target_quantity' => ['sometimes', 'integer', 'min:1', 'max:1000'],
            'work_dates' => ['nullable', 'array'],
            'work_dates.*' => ['date'],
            'work_shifts' => ['nullable', 'array'],
            'work_shifts.*' => ['string', 'in:sang,chieu,toi,ca_ngay'],
            'overtime_hours' => ['nullable', 'integer', 'min:1', 'max:8'],
            'shift_rate' => ['nullable', 'integer', 'min:0'],
            'overtime_rate' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
