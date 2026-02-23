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

// Employer routes
Route::middleware(['auth', 'role:employer'])->prefix('employer')->name('employer.')->group(function () {
    Route::get('/profile', [EmployerProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [EmployerProfileController::class, 'update'])->name('profile.update');

    Route::resource('jobs', JobPostController::class)->only(['create', 'store', 'edit', 'update', 'destroy']);

    Route::get('/applications', [ApplicationController::class, 'employerIndex'])->name('applications.index');
    Route::patch('/applications/{application}', [ApplicationController::class, 'update'])->name('applications.update');

    Route::post('/applications/{application}/interview', [InterviewController::class, 'store'])->name('interviews.store');
    Route::patch('/interviews/{interview}', [InterviewController::class, 'update'])->name('interviews.update');
});

// Landlord routes
Route::middleware(['auth', 'role:landlord'])->prefix('landlord')->name('landlord.')->group(function () {
    Route::resource('rooms', RoomController::class)->only(['create', 'store', 'edit', 'update', 'destroy']);
    Route::resource('contracts', TenantContractController::class);
});

require __DIR__.'/auth.php';
