<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateJobPostRequest extends FormRequest
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
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'required', 'string'],
            'job_type' => ['sometimes', 'required', 'in:seasonal,office'],
            'category_id' => ['sometimes', 'nullable', 'exists:job_categories,id'],
            'salary_min' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'salary_max' => ['sometimes', 'nullable', 'numeric', 'min:0', 'gte:salary_min'],
            'salary_type' => ['sometimes', 'nullable', 'string'],
            'location' => ['sometimes', 'nullable', 'string', 'max:255'],
            'district' => ['sometimes', 'nullable', 'string', 'max:100'],
            'city' => ['sometimes', 'nullable', 'string', 'max:100'],
            'requirements' => ['sometimes', 'nullable', 'string'],
            'benefits' => ['sometimes', 'nullable', 'string'],
            'slots' => ['sometimes', 'nullable', 'integer', 'min:1'],
            'deadline' => ['sometimes', 'nullable', 'date', 'after:today'],
            'status' => ['sometimes', 'required', 'in:draft,active'],
            'work_schedule' => ['sometimes', 'nullable', 'string'],
            'experience_level' => ['sometimes', 'nullable', 'string'],
        ];
    }
}
