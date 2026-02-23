<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRoomRequest extends FormRequest
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
            'description' => ['sometimes', 'nullable', 'string'],
            'room_type' => ['sometimes', 'required', 'in:single,shared,apartment,mini_apartment'],
            'price' => ['sometimes', 'required', 'numeric', 'min:0'],
            'area_sqm' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'address' => ['sometimes', 'nullable', 'string', 'max:255'],
            'district' => ['sometimes', 'nullable', 'string', 'max:100'],
            'city' => ['sometimes', 'nullable', 'string', 'max:100'],
            'amenities' => ['sometimes', 'nullable', 'array'],
            'images' => ['sometimes', 'nullable', 'array'],
            'status' => ['sometimes', 'required', 'in:available,rented,maintenance'],
            'max_tenants' => ['sometimes', 'nullable', 'integer', 'min:1'],
            'electricity_price' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'water_price' => ['sometimes', 'nullable', 'numeric', 'min:0'],
        ];
    }
}
