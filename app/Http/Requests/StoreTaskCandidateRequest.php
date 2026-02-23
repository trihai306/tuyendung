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
            'application_id' => ['nullable', 'integer', 'exists:applications,id'],
            'candidate_name' => ['required_without:application_id', 'nullable', 'string', 'max:255'],
            'candidate_phone' => ['nullable', 'string', 'max:20'],
            'candidate_email' => ['nullable', 'email', 'max:255'],
            'status' => ['sometimes', 'in:hired,trial,rejected'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'hired_date' => ['nullable', 'date'],
        ];
    }
}
