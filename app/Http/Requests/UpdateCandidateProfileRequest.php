<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCandidateProfileRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'bio' => ['nullable', 'string'],
            'skills' => ['nullable', 'array'],
            'experience_years' => ['nullable', 'integer', 'min:0'],
            'education' => ['nullable', 'string'],
            'resume_url' => ['nullable', 'string', 'max:255'],
            'desired_salary' => ['nullable', 'numeric', 'min:0'],
            'job_type_preference' => ['nullable', 'string'],
            'current_address' => ['nullable', 'string'],
            'district' => ['nullable', 'string'],
            'city' => ['nullable', 'string'],
            'date_of_birth' => ['nullable', 'date'],
            'gender' => ['nullable', 'string'],
        ];
    }
}
