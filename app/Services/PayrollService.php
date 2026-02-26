<?php

declare(strict_types=1);

namespace App\Services;

use App\Config\PermissionConfig;
use App\Models\CompanyMember;
use App\Models\Payroll;
use App\Models\RecruitmentTask;
use App\Models\User;

class PayrollService
{
    /**
     * Get the user's company role.
     */
    public function getUserRole(User $user): string
    {
        $company = $user->getCompany();

        if (!$company) {
            return 'owner';
        }

        $membership = CompanyMember::where('employer_profile_id', $company->id)
            ->where('user_id', $user->id)
            ->active()
            ->first();

        return $membership?->role ?? 'owner';
    }

    /**
     * Get payroll data: tasks, payrolls, and summary stats.
     */
    public function getPayrollData(User $user): array
    {
        $company = $user->getCompany();
        $ownerId = $company ? $company->user_id : $user->id;

        $tasks = RecruitmentTask::whereHas('employerProfile', function ($q) use ($ownerId): void {
            $q->where('user_id', $ownerId);
        })
            ->where('type', 'thoi_vu')
            ->with(['candidates', 'candidates.payrolls'])
            ->orderByDesc('created_at')
            ->get();

        $payrolls = Payroll::whereHas('recruitmentTask.employerProfile', function ($q) use ($ownerId): void {
            $q->where('user_id', $ownerId);
        })
            ->with(['taskCandidate', 'recruitmentTask'])
            ->orderByDesc('created_at')
            ->get();

        $totalAmount = $payrolls->sum('total_amount');
        $paidAmount = $payrolls->where('status', 'paid')->sum('total_amount');
        $pendingAmount = $payrolls->whereIn('status', ['draft', 'confirmed'])->sum('total_amount');

        return [
            'tasks' => $tasks,
            'payrolls' => $payrolls,
            'stats' => [
                'totalAmount' => (int) $totalAmount,
                'paidAmount' => (int) $paidAmount,
                'pendingAmount' => (int) $pendingAmount,
                'payrollCount' => $payrolls->count(),
            ],
        ];
    }

    /**
     * Create a new payroll record.
     */
    public function createPayroll(array $validated): Payroll
    {
        $payroll = new Payroll($validated);
        $payroll->calculateTotal();
        $payroll->save();

        return $payroll;
    }

    /**
     * Update a payroll record.
     */
    public function updatePayroll(Payroll $payroll, array $validated): Payroll
    {
        abort_if($payroll->status === 'paid', 422, 'Khong the cap nhat bang luong da thanh toan.');

        $payroll->fill($validated);
        $payroll->calculateTotal();
        $payroll->save();

        return $payroll;
    }

    /**
     * Delete a payroll record.
     */
    public function deletePayroll(Payroll $payroll): void
    {
        abort_if($payroll->status === 'paid', 422, 'Khong the xoa bang luong da thanh toan.');

        $payroll->delete();
    }

    /**
     * Mark a payroll as paid.
     */
    public function markAsPaid(Payroll $payroll): Payroll
    {
        abort_unless($payroll->status === 'confirmed', 422, 'Chi co the thanh toan bang luong da xac nhan.');

        $payroll->update([
            'status' => 'paid',
            'paid_at' => now(),
        ]);

        return $payroll;
    }
}
