<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAiAgentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'type' => ['sometimes', Rule::in(['messaging', 'posting', 'recruiting'])],
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
        ];
    }
}
