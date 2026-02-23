<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEmployerProfileRequest extends FormRequest
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
            'company_name' => ['nullable', 'string', 'max:255'],
            'company_logo' => ['nullable', 'string'],
            'industry' => ['nullable', 'string'],
            'company_size' => ['nullable', 'string'],
            'address' => ['nullable', 'string'],
            'district' => ['nullable', 'string'],
            'city' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'tax_code' => ['nullable', 'string'],
            'website' => ['nullable', 'url'],
            'contact_phone' => ['nullable', 'string'],
            'contact_email' => ['nullable', 'email'],
        ];
    }
}
