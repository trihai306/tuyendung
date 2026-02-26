<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRecruitmentTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'assigned_to' => ['required', 'array', 'min:1'],
            'assigned_to.*' => ['integer', 'exists:users,id'],
            'title' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:chinh_thuc,thoi_vu'],
            'description' => ['nullable', 'string', 'max:5000'],
            'priority' => ['required', 'in:low,medium,high,urgent'],
            'target_quantity' => ['required', 'integer', 'min:1', 'max:1000'],
            'due_date' => ['nullable', 'date', 'after:today'],
            'work_dates' => ['nullable', 'required_if:type,thoi_vu', 'array', 'min:1'],
            'work_dates.*' => ['date'],
            'work_shifts' => ['nullable', 'required_if:type,thoi_vu', 'array', 'min:1'],
            'work_shifts.*' => ['string', 'in:sang,chieu,toi,ca_ngay'],
            'overtime_hours' => ['nullable', 'integer', 'min:1', 'max:8'],
            'shift_rate' => ['nullable', 'integer', 'min:0'],
            'overtime_rate' => ['nullable', 'integer', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'assigned_to.required' => 'Vui long chon nguoi phu trach.',
            'title.required' => 'Vui long nhap tieu de nhiem vu.',
            'type.required' => 'Vui long chon loai tuyen dung.',
            'priority.required' => 'Vui long chon muc do uu tien.',
            'target_quantity.required' => 'Vui long nhap so luong yeu cau.',
            'target_quantity.min' => 'So luong phai it nhat la 1.',
            'work_dates.required_if' => 'Vui long chon ngay lam viec cho tuyen dung thoi vu.',
            'work_shifts.required_if' => 'Vui long chon ca lam viec cho tuyen dung thoi vu.',
        ];
    }
}
