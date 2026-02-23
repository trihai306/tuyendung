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
            'assigned_to' => ['required', 'exists:users,id'],
            'title' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:chinh_thuc,thoi_vu'],
            'description' => ['nullable', 'string', 'max:5000'],
            'priority' => ['required', 'in:low,medium,high,urgent'],
            'target_quantity' => ['required', 'integer', 'min:1', 'max:1000'],
            'due_date' => ['nullable', 'date', 'after:today'],
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
        ];
    }
}
