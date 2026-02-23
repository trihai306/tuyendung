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
use App\Http\Controllers\ReportController;
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
    Route::get('/tasks/{task}', [RecruitmentTaskController::class, 'show'])->name('tasks.show');
    Route::post('/tasks/{task}/candidates', [RecruitmentTaskController::class, 'addCandidate'])->name('tasks.candidates.store');
    Route::delete('/tasks/{task}/candidates/{candidate}', [RecruitmentTaskController::class, 'removeCandidate'])->name('tasks.candidates.destroy');

    // Team - view only for all members
    Route::get('/team', [CompanyMemberController::class, 'index'])->name('team.index');

    // Reports - view for all members
    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
});

// Employer routes - Manager+ (owner, manager)
Route::middleware(['auth', 'role:employer', 'company.role:owner,manager'])->prefix('employer')->name('employer.')->group(function () {
    Route::patch('/profile', [EmployerProfileController::class, 'update'])->name('profile.update');

    // Jobs CUD
    Route::resource('jobs', JobPostController::class)->only(['create', 'store', 'edit', 'update']);

    // Applications management
    Route::post('/applications/external', [ApplicationController::class, 'storeExternal'])->name('applications.store-external');
    Route::patch('/applications/{application}', [ApplicationController::class, 'update'])->name('applications.update');

    // Interviews
    Route::post('/applications/{application}/interview', [InterviewController::class, 'store'])->name('interviews.store');
    Route::patch('/interviews/{interview}', [InterviewController::class, 'update'])->name('interviews.update');

    // Team management
    Route::post('/team', [CompanyMemberController::class, 'store'])->name('team.store');
    Route::delete('/team/{team}', [CompanyMemberController::class, 'destroy'])->name('team.destroy');

    // Tasks create/update
    Route::get('/tasks/create', [RecruitmentTaskController::class, 'create'])->name('tasks.create');
    Route::post('/tasks', [RecruitmentTaskController::class, 'store'])->name('tasks.store');
    Route::put('/tasks/{task}', [RecruitmentTaskController::class, 'update'])->name('tasks.update');
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
