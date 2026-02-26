<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTaskCandidateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'application_ids' => ['required', 'array', 'min:1'],
            'application_ids.*' => ['integer', 'exists:applications,id'],
            'status' => ['sometimes', 'in:hired,trial,rejected'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'hired_date' => ['nullable', 'date'],
        ];
    }
}
