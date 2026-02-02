<?php

namespace App\Filament\Exports;

use App\Models\User;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class UserExport implements FromQuery, WithHeadings, WithMapping
{
    use Exportable;

    public function query()
    {
        return User::query()->with('roles');
    }

    public function headings(): array
    {
        return [
            'ID',
            'Tên',
            'Email',
            'Roles',
            'Email đã xác thực',
            'Ngày tạo',
        ];
    }

    public function map($user): array
    {
        return [
            $user->id,
            $user->name,
            $user->email,
            $user->roles->pluck('name')->join(', '),
            $user->email_verified_at ? 'Có' : 'Chưa',
            $user->created_at->format('d/m/Y H:i'),
        ];
    }
}
