<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Config\PermissionConfig;
use App\Models\Payroll;
use App\Services\PayrollService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PayrollController extends Controller
{
    public function __construct(
        private readonly PayrollService $payrollService,
    ) {
    }

    /**
     * Display payroll management page.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        abort_unless($user->isEmployer(), 403);

        $role = $this->payrollService->getUserRole($user);
        abort_unless(PermissionConfig::can($role, 'payroll.view'), 403);

        $data = $this->payrollService->getPayrollData($user);

        return Inertia::render('Employer/Payroll/Index', $data);
    }

    /**
     * Create a new payroll record.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user->isEmployer(), 403);

        $role = $this->payrollService->getUserRole($user);
        abort_unless(PermissionConfig::can($role, 'payroll.manage'), 403);

        $validated = $request->validate([
            'task_candidate_id' => ['required', 'integer', 'exists:task_candidates,id'],
            'recruitment_task_id' => ['required', 'integer', 'exists:recruitment_tasks,id'],
            'period_start' => ['required', 'date'],
            'period_end' => ['required', 'date', 'after_or_equal:period_start'],
            'total_shifts' => ['required', 'integer', 'min:0'],
            'overtime_hours' => ['nullable', 'integer', 'min:0'],
            'shift_amount' => ['required', 'numeric', 'min:0'],
            'overtime_amount' => ['nullable', 'numeric', 'min:0'],
            'bonus' => ['nullable', 'numeric', 'min:0'],
            'deduction' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $this->payrollService->createPayroll($validated);

        return redirect()->back()->with('success', 'Da tao bang luong thanh cong.');
    }

    /**
     * Update a payroll record.
     */
    public function update(Request $request, Payroll $payroll): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user->isEmployer(), 403);

        $role = $this->payrollService->getUserRole($user);
        abort_unless(PermissionConfig::can($role, 'payroll.manage'), 403);

        $validated = $request->validate([
            'period_start' => ['sometimes', 'date'],
            'period_end' => ['sometimes', 'date', 'after_or_equal:period_start'],
            'total_shifts' => ['sometimes', 'integer', 'min:0'],
            'overtime_hours' => ['nullable', 'integer', 'min:0'],
            'shift_amount' => ['sometimes', 'numeric', 'min:0'],
            'overtime_amount' => ['nullable', 'numeric', 'min:0'],
            'bonus' => ['nullable', 'numeric', 'min:0'],
            'deduction' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'status' => ['nullable', 'in:draft,confirmed'],
        ]);

        $this->payrollService->updatePayroll($payroll, $validated);

        return redirect()->back()->with('success', 'Da cap nhat bang luong thanh cong.');
    }

    /**
     * Delete a payroll record.
     */
    public function destroy(Request $request, Payroll $payroll): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user->isEmployer(), 403);

        $role = $this->payrollService->getUserRole($user);
        abort_unless(PermissionConfig::can($role, 'payroll.manage'), 403);

        $this->payrollService->deletePayroll($payroll);

        return redirect()->back()->with('success', 'Da xoa bang luong thanh cong.');
    }

    /**
     * Mark payroll as paid.
     */
    public function markAsPaid(Request $request, Payroll $payroll): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user->isEmployer(), 403);

        $role = $this->payrollService->getUserRole($user);
        abort_unless(PermissionConfig::can($role, 'payroll.manage'), 403);

        $this->payrollService->markAsPaid($payroll);

        return redirect()->back()->with('success', 'Da danh dau thanh toan thanh cong.');
    }
}
