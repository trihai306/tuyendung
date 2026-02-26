<?php

use App\Http\Controllers\HomeController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\JobPostController;
use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\SavedJobController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\TenantContractController;
use App\Http\Controllers\CandidateProfileController;
use App\Http\Controllers\EmployerProfileController;
use App\Http\Controllers\InterviewController;
use App\Http\Controllers\CompanyMemberController;
use App\Http\Controllers\RecruitmentTaskController;
use App\Http\Controllers\PayrollController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\BroadcastController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\AiAgentController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/viec-lam', [JobPostController::class, 'index'])->name('jobs.index');
Route::get('/viec-lam/{jobPost:slug}', [JobPostController::class, 'show'])->name('jobs.show');
Route::get('/phong-tro', [RoomController::class, 'index'])->name('rooms.index');
Route::get('/phong-tro/{room:slug}', [RoomController::class, 'show'])->name('rooms.show');

// Auth routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/broadcast/test', [BroadcastController::class, 'test'])->name('broadcast.test');

    // Notifications
    Route::prefix('notifications')->name('notifications.')->group(function () {
        Route::get('/', [NotificationController::class, 'index'])->name('index');
        Route::get('/api', [NotificationController::class, 'apiIndex'])->name('api');
        Route::patch('/{notification}/read', [NotificationController::class, 'markAsRead'])->name('read');
        Route::post('/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('mark-all-read');
        Route::delete('/{notification}', [NotificationController::class, 'destroy'])->name('destroy');
    });
});

// Profile routes
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Candidate routes
Route::middleware(['auth', 'role:candidate'])->prefix('candidate')->name('candidate.')->group(function () {
    Route::get('/profile', [CandidateProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [CandidateProfileController::class, 'update'])->name('profile.update');

    Route::post('/jobs/{jobPost}/apply', [ApplicationController::class, 'store'])->name('jobs.apply');
    Route::get('/applications', [ApplicationController::class, 'index'])->name('applications.index');
    Route::get('/applications/{application}', [ApplicationController::class, 'show'])->name('applications.show');

    Route::post('/jobs/{jobPost}/save', [SavedJobController::class, 'toggle'])->name('jobs.save');
    Route::get('/saved-jobs', [SavedJobController::class, 'index'])->name('saved-jobs.index');
});

// Employer routes - All company members (owner, manager, member)
Route::middleware(['auth', 'role:employer', 'company.role:owner,manager,member'])->prefix('employer')->name('employer.')->group(function () {
    Route::get('/profile', [EmployerProfileController::class, 'edit'])->name('profile.edit');

    // View-only routes
    Route::get('/jobs', [JobPostController::class, 'employerIndex'])->name('jobs.index');
    Route::get('/applications', [ApplicationController::class, 'employerIndex'])->name('applications.index');
    Route::get('/applications/{application}', [ApplicationController::class, 'employerShow'])->name('applications.show');
    Route::get('/tasks', [RecruitmentTaskController::class, 'index'])->name('tasks.index');
    Route::get('/tasks/create', [RecruitmentTaskController::class, 'create'])->name('tasks.create');
    Route::get('/tasks/{task}', [RecruitmentTaskController::class, 'show'])->name('tasks.show');
    Route::get('/tasks/{task}/applications', [RecruitmentTaskController::class, 'searchApplications'])->name('tasks.applications.search');
    Route::post('/tasks/{task}/candidates', [RecruitmentTaskController::class, 'addCandidate'])->name('tasks.candidates.store');
    Route::delete('/tasks/{task}/candidates/{candidate}', [RecruitmentTaskController::class, 'removeCandidate'])->name('tasks.candidates.destroy');
    Route::put('/tasks/{task}', [RecruitmentTaskController::class, 'update'])->name('tasks.update');

    // Attendance management (members can manage their own tasks)
    Route::get('/tasks/{task}/attendance-management', [RecruitmentTaskController::class, 'attendance'])->name('tasks.attendance');
    Route::get('/attendance', [AttendanceController::class, 'index'])->name('attendance.index');
    Route::post('/tasks/{task}/attendance', [AttendanceController::class, 'bulkStore'])->name('attendance.bulk-store');
    Route::get('/tasks/{task}/attendance', [AttendanceController::class, 'getByTask'])->name('attendance.by-task');
    Route::delete('/attendance/{attendance}', [AttendanceController::class, 'destroy'])->name('attendance.destroy');

    // Team - view only for all members
    Route::get('/team', [CompanyMemberController::class, 'index'])->name('team.index');

    // Reports - view for all members
    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
});

// Employer routes - Manager+ (owner, manager)
Route::middleware(['auth', 'role:employer', 'company.role:owner,manager'])->prefix('employer')->name('employer.')->group(function () {
    Route::patch('/profile', [EmployerProfileController::class, 'update'])->name('profile.update');

    // Jobs CUD
    Route::resource('jobs', JobPostController::class)
        ->only(['create', 'store', 'edit', 'update'])
        ->parameters(['jobs' => 'jobPost']);

    // Applications management
    Route::post('/applications/external', [ApplicationController::class, 'storeExternal'])->name('applications.store-external');
    Route::post('/applications/transfer', [ApplicationController::class, 'transfer'])->name('applications.transfer');
    Route::post('/applications/bulk-delete', [ApplicationController::class, 'bulkDestroy'])->name('applications.bulk-delete');
    Route::patch('/applications/{application}', [ApplicationController::class, 'update'])->name('applications.update');
    Route::delete('/applications/{application}', [ApplicationController::class, 'destroy'])->name('applications.destroy');

    // Interviews
    Route::post('/applications/{application}/interview', [InterviewController::class, 'store'])->name('interviews.store');
    Route::patch('/interviews/{interview}', [InterviewController::class, 'update'])->name('interviews.update');

    // Team management
    Route::post('/team', [CompanyMemberController::class, 'store'])->name('team.store');
    Route::patch('/team/{member}/assign-manager', [CompanyMemberController::class, 'assignManager'])->name('team.assign-manager');
    Route::delete('/team/{team}', [CompanyMemberController::class, 'destroy'])->name('team.destroy');

    // Tasks create/edit/delete (manager+)
    Route::post('/tasks', [RecruitmentTaskController::class, 'store'])->name('tasks.store');
    Route::get('/tasks/{task}/edit', [RecruitmentTaskController::class, 'edit'])->name('tasks.edit');
    Route::delete('/tasks/{task}', [RecruitmentTaskController::class, 'destroy'])->name('tasks.destroy');

    // Payroll
    Route::get('/payroll', [PayrollController::class, 'index'])->name('payroll.index');
    Route::post('/payroll', [PayrollController::class, 'store'])->name('payroll.store');
    Route::put('/payroll/{payroll}', [PayrollController::class, 'update'])->name('payroll.update');
    Route::delete('/payroll/{payroll}', [PayrollController::class, 'destroy'])->name('payroll.destroy');
    Route::post('/payroll/{payroll}/mark-paid', [PayrollController::class, 'markAsPaid'])->name('payroll.mark-paid');
    Route::post('/payroll/generate-from-attendance', [PayrollController::class, 'generateFromAttendance'])->name('payroll.generate-from-attendance');

    // AI Agents (employer only uses, admin manages)
    Route::get('/ai-agents', [AiAgentController::class, 'index'])->name('ai-agents.index');
    Route::get('/ai-agents/{aiAgent}', [AiAgentController::class, 'show'])->name('ai-agents.show');
    Route::patch('/ai-agents/{aiAgent}/toggle', [AiAgentController::class, 'toggleActivation'])->name('ai-agents.toggle');
    Route::post('/ai-agents/{aiAgent}/config', [AiAgentController::class, 'saveConfig'])->name('ai-agents.config');
    Route::post('/ai-agents/{aiAgent}/scenarios/{scenario}/run', [AiAgentController::class, 'runScenario'])->name('ai-agents.run-scenario');
});

// Employer routes - Owner only
Route::middleware(['auth', 'role:employer', 'company.role:owner'])->prefix('employer')->name('employer.')->group(function () {
    // Delete jobs
    Route::delete('/jobs/{job}', [JobPostController::class, 'destroy'])->name('jobs.destroy');

    // Team role changes & invite code
    Route::put('/team/{team}', [CompanyMemberController::class, 'update'])->name('team.update');
    Route::post('/team/regenerate-code', [CompanyMemberController::class, 'regenerateCode'])->name('team.regenerate-code');
});

// Join company by invite code (any authenticated user)
Route::middleware('auth')->post('/join-team', [CompanyMemberController::class, 'joinByCode'])
    ->name('team.join');

// Landlord routes
Route::middleware(['auth', 'role:landlord'])->prefix('landlord')->name('landlord.')->group(function () {
    Route::resource('rooms', RoomController::class)->only(['create', 'store', 'edit', 'update', 'destroy']);
    Route::resource('contracts', TenantContractController::class);
});

require __DIR__ . '/auth.php';
