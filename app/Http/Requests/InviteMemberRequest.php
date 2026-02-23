<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class InviteMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'email', 'max:255'],
            'name' => ['nullable', 'string', 'max:255'],
            'role' => ['required', 'in:manager,member'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.required' => 'Vui long nhap email.',
            'email.email' => 'Email khong hop le.',
            'role.required' => 'Vui long chon vai tro.',
            'role.in' => 'Vai tro khong hop le.',
        ];
    }
}
