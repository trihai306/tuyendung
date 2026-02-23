<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreJobPostRequest extends FormRequest
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
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'job_type' => ['required', 'in:seasonal,office'],
            'category_id' => ['nullable', 'exists:job_categories,id'],
            'salary_min' => ['nullable', 'numeric', 'min:0'],
            'salary_max' => ['nullable', 'numeric', 'min:0', 'gte:salary_min'],
            'salary_type' => ['nullable', 'string'],
            'location' => ['nullable', 'string', 'max:255'],
            'district' => ['nullable', 'string', 'max:100'],
            'city' => ['nullable', 'string', 'max:100'],
            'requirements' => ['nullable', 'string'],
            'benefits' => ['nullable', 'string'],
            'slots' => ['nullable', 'integer', 'min:1'],
            'deadline' => ['nullable', 'date', 'after:today'],
            'status' => ['required', 'in:draft,active'],
            'work_schedule' => ['nullable', 'string'],
            'experience_level' => ['nullable', 'string'],
        ];
    }
}
