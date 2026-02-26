<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAiAgentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', Rule::in(['messaging', 'posting', 'recruiting'])],
            'description' => ['nullable', 'string', 'max:1000'],
            'status' => ['sometimes', Rule::in(['active', 'paused', 'disabled'])],
            'config' => ['nullable', 'array'],
            'config.channels' => ['nullable', 'array'],
            'config.channels.*' => ['string', Rule::in(['zalo', 'facebook', 'email'])],
            'config.prompt' => ['nullable', 'string', 'max:2000'],
            'config.auto_reply' => ['nullable', 'boolean'],
            'schedule' => ['nullable', 'array'],
            'schedule.frequency' => ['nullable', 'string', Rule::in(['hourly', 'daily', 'weekly', 'custom'])],
            'schedule.time' => ['nullable', 'string'],
            'schedule.days' => ['nullable', 'array'],
            // Scenarios inline creation
            'scenarios' => ['nullable', 'array'],
            'scenarios.*.name' => ['required_with:scenarios', 'string', 'max:255'],
            'scenarios.*.trigger_type' => ['required_with:scenarios', Rule::in(['manual', 'scheduled', 'event'])],
            'scenarios.*.trigger_config' => ['nullable', 'array'],
            'scenarios.*.actions' => ['required_with:scenarios', 'array'],
            'scenarios.*.is_active' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Vui long nhap ten tro ly.',
            'type.required' => 'Vui long chon loai tro ly.',
            'type.in' => 'Loai tro ly khong hop le.',
        ];
    }
}
