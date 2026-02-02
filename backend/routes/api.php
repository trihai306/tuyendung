<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CompanyController;
use App\Http\Controllers\Api\ConversationController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\JobController;
use App\Http\Controllers\Api\CandidateController;
use App\Http\Controllers\Api\PackageController;
use App\Http\Controllers\Api\PlatformAccountController;
use App\Http\Controllers\Api\SeatController;
use App\Http\Controllers\Api\SubscriptionController;
use App\Http\Controllers\Api\WebhookController;
use App\Http\Controllers\Api\ZaloController;
use App\Http\Controllers\Api\ZaloWebhookController;

// Public routes
Route::prefix('auth')->name('auth.')->group(function () {
    Route::post('/register', [AuthController::class, 'register'])->name('register');
    Route::post('/login', [AuthController::class, 'login'])->name('login');
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->name('forgot-password');
});

// Public packages route
Route::get('/packages', [PackageController::class, 'index'])->name('packages.index');
Route::get('/packages/{slug}', [PackageController::class, 'show'])->name('packages.show');

// Test broadcast route
Route::post('/test-broadcast', function () {
    event(new \App\Events\TestBroadcastEvent('Hello from Laravel at ' . now()->format('H:i:s')));
    return response()->json(['message' => 'Event broadcasted!']);
});

// Webhook routes (no auth required)
Route::prefix('webhooks')->name('webhooks.')->group(function () {
    Route::get('/zalo', [WebhookController::class, 'zaloVerify'])->name('zalo.verify');
    Route::post('/zalo', [WebhookController::class, 'zalo'])->name('zalo');
    Route::get('/facebook', [WebhookController::class, 'facebookVerify'])->name('facebook.verify');
    Route::post('/facebook', [WebhookController::class, 'facebook'])->name('facebook');
});

// Zalo personal webhooks (from multizlogin)
Route::prefix('zalo-webhook')->name('zalo-webhook.')->group(function () {
    Route::post('/', [ZaloWebhookController::class, 'handle'])->name('handle');
    Route::post('/message', [ZaloWebhookController::class, 'handleMessage'])->name('message');
    Route::post('/group-event', [ZaloWebhookController::class, 'handleGroupEvent'])->name('group-event');
    Route::post('/reaction', [ZaloWebhookController::class, 'handleReaction'])->name('reaction');
    Route::post('/status', [ZaloWebhookController::class, 'handleStatus'])->name('status');
});

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::prefix('auth')->name('auth.')->group(function () {
        Route::get('/me', [AuthController::class, 'me'])->name('me');
        Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
        Route::post('/logout-all', [AuthController::class, 'logoutAll'])->name('logout-all');
        Route::patch('/profile', [AuthController::class, 'updateProfile'])->name('profile.update');
        Route::patch('/password', [AuthController::class, 'updatePassword'])->name('password.update');
    });

    // Platform Accounts
    Route::apiResource('platform-accounts', PlatformAccountController::class);
    Route::post('/platform-accounts/{platformAccount}/sync-channels', [PlatformAccountController::class, 'syncChannels'])
        ->name('platform-accounts.sync');
    Route::post('/platform-accounts/{platformAccount}/refresh-token', [PlatformAccountController::class, 'refreshToken'])
        ->name('platform-accounts.refresh');
    Route::post('/oauth/{platform}/callback', [PlatformAccountController::class, 'oauthCallback'])
        ->name('oauth.callback');

    // Conversations (Inbox)
    Route::prefix('inbox')->name('inbox.')->group(function () {
        Route::get('/conversations', [ConversationController::class, 'index'])->name('conversations.index');
        Route::get('/conversations/{conversation}', [ConversationController::class, 'show'])->name('conversations.show');
        Route::patch('/conversations/{conversation}', [ConversationController::class, 'update'])->name('conversations.update');
        Route::post('/conversations/{conversation}/assign', [ConversationController::class, 'assign'])->name('conversations.assign');
        Route::get('/conversations/{conversation}/messages', [ConversationController::class, 'messages'])->name('conversations.messages');
        Route::post('/conversations/{conversation}/messages', [ConversationController::class, 'sendMessage'])->name('conversations.send');
        Route::post('/conversations/{conversation}/candidate', [ConversationController::class, 'createCandidate'])->name('conversations.candidate');
    });

    // Jobs
    Route::apiResource('jobs', JobController::class);
    Route::post('/jobs/{job}/publish', [JobController::class, 'publish'])->name('jobs.publish');
    Route::post('/jobs/{job}/close', [JobController::class, 'close'])->name('jobs.close');
    Route::get('/jobs/{job}/pipeline', [JobController::class, 'pipeline'])->name('jobs.pipeline');

    // Applications
    Route::patch('/applications/{application}/move-stage', [JobController::class, 'moveStage'])->name('applications.move');

    // Candidates
    Route::apiResource('candidates', CandidateController::class);
    Route::post('/candidates/{candidate}/apply', [CandidateController::class, 'applyToJob'])->name('candidates.apply');

    // Company Management
    Route::prefix('company')->name('company.')->group(function () {
        Route::get('/', [CompanyController::class, 'show'])->name('show');
        Route::post('/', [CompanyController::class, 'store'])->name('store');
        Route::put('/', [CompanyController::class, 'update'])->name('update');
        Route::get('/stats', [CompanyController::class, 'stats'])->name('stats');
        Route::get('/activities', [CompanyController::class, 'activities'])->name('activities');
        Route::get('/members', [CompanyController::class, 'members'])->name('members');
        Route::post('/members', [CompanyController::class, 'inviteMember'])->name('members.invite');
        Route::put('/members/{member}', [CompanyController::class, 'updateMember'])->name('members.update');
        Route::delete('/members/{member}', [CompanyController::class, 'removeMember'])->name('members.remove');
    });

    // Dashboard (Member-specific data)
    Route::prefix('dashboard')->name('dashboard.')->group(function () {
        Route::get('/my-stats', [DashboardController::class, 'myStats'])->name('my-stats');
        Route::get('/tasks', [DashboardController::class, 'tasks'])->name('tasks');
        Route::get('/interviews', [DashboardController::class, 'interviews'])->name('interviews');
    });

    // Subscription
    Route::prefix('subscription')->name('subscription.')->group(function () {
        Route::get('/', [SubscriptionController::class, 'show'])->name('show');
        Route::post('/', [SubscriptionController::class, 'store'])->name('store');
        Route::post('/cancel', [SubscriptionController::class, 'cancel'])->name('cancel');
    });

    // Seats (Per-employee pricing)
    Route::prefix('seats')->name('seats.')->group(function () {
        Route::get('/pricing', [SeatController::class, 'getPricing'])->name('pricing');
        Route::get('/', [SeatController::class, 'getCompanySeats'])->name('index');
        Route::post('/purchase', [SeatController::class, 'purchaseSeats'])->name('purchase');
        Route::post('/assign', [SeatController::class, 'assignSeat'])->name('assign');
        Route::post('/unassign', [SeatController::class, 'unassignSeat'])->name('unassign');
    });

    // Zalo Management
    Route::prefix('zalo')->name('zalo.')->group(function () {
        // Inbox routes (must be before /{zaloAccount} to avoid route conflict)
        Route::get('/inbox/conversations', [ZaloController::class, 'getConversations'])->name('inbox.conversations');
        Route::get('/inbox/messages/{threadId}', [ZaloController::class, 'getMessages'])->name('inbox.messages');

        Route::get('/', [ZaloController::class, 'index'])->name('index');
        Route::get('/status', [ZaloController::class, 'status'])->name('status');
        Route::post('/login', [ZaloController::class, 'initiateLogin'])->name('login');
        Route::post('/sync', [ZaloController::class, 'syncAccounts'])->name('sync');
        Route::get('/{zaloAccount}', [ZaloController::class, 'show'])->name('show');
        Route::delete('/{zaloAccount}', [ZaloController::class, 'destroy'])->name('destroy');
        Route::post('/{zaloAccount}/sync-groups', [ZaloController::class, 'syncGroups'])->name('sync-groups');
        Route::post('/{zaloAccount}/send-message', [ZaloController::class, 'sendMessage'])->name('send-message');
        Route::post('/{zaloAccount}/webhook', [ZaloController::class, 'configureWebhook'])->name('webhook');
        Route::post('/{zaloAccount}/assign-user', [ZaloController::class, 'assignUser'])->name('assign-user');
        Route::post('/{zaloAccount}/disconnect', [ZaloController::class, 'disconnect'])->name('disconnect');

        // Extended APIs
        Route::post('/{zaloAccount}/find-user', [ZaloController::class, 'findUser'])->name('find-user');
        Route::get('/{zaloAccount}/friends', [ZaloController::class, 'getFriends'])->name('friends');
        Route::post('/{zaloAccount}/friends/add', [ZaloController::class, 'sendFriendRequest'])->name('friends.add');
        Route::post('/{zaloAccount}/friends/accept', [ZaloController::class, 'acceptFriendRequest'])->name('friends.accept');
        Route::post('/{zaloAccount}/groups/create', [ZaloController::class, 'createGroup'])->name('groups.create');
        Route::post('/{zaloAccount}/groups/{groupId}/add', [ZaloController::class, 'addMemberToGroup'])->name('groups.add-member');
        Route::post('/{zaloAccount}/groups/{groupId}/remove', [ZaloController::class, 'removeMemberFromGroup'])->name('groups.remove-member');
        Route::post('/{zaloAccount}/users/{userId}/block', [ZaloController::class, 'blockUser'])->name('users.block');
        Route::post('/{zaloAccount}/users/{userId}/unblock', [ZaloController::class, 'unblockUser'])->name('users.unblock');
        Route::post('/{zaloAccount}/react', [ZaloController::class, 'reactToMessage'])->name('react');
        Route::post('/{zaloAccount}/delete-message', [ZaloController::class, 'deleteMessage'])->name('delete-message');
        Route::post('/{zaloAccount}/send-sticker', [ZaloController::class, 'sendSticker'])->name('send-sticker');

        // Additional APIs (Full CLI Parity)
        Route::post('/{zaloAccount}/send-voice', [ZaloController::class, 'sendVoice'])->name('send-voice');
        Route::post('/{zaloAccount}/send-card', [ZaloController::class, 'sendCard'])->name('send-card');
        Route::post('/{zaloAccount}/user-info', [ZaloController::class, 'getUserInfo'])->name('user-info');
        Route::get('/{zaloAccount}/account-info', [ZaloController::class, 'getAccountInfo'])->name('account-info');
        Route::get('/{zaloAccount}/stickers', [ZaloController::class, 'getStickers'])->name('stickers');
        Route::get('/{zaloAccount}/groups/{groupId}/info', [ZaloController::class, 'getGroupInfo'])->name('groups.info');
        Route::post('/{zaloAccount}/groups/{groupId}/rename', [ZaloController::class, 'renameGroup'])->name('groups.rename');
        Route::post('/{zaloAccount}/groups/{groupId}/delete', [ZaloController::class, 'deleteGroup'])->name('groups.delete');
        Route::post('/{zaloAccount}/groups/{groupId}/promote', [ZaloController::class, 'promoteToAdmin'])->name('groups.promote');
        Route::post('/{zaloAccount}/groups/{groupId}/demote', [ZaloController::class, 'demoteFromAdmin'])->name('groups.demote');
        Route::post('/{zaloAccount}/groups/{groupId}/transfer', [ZaloController::class, 'transferOwnership'])->name('groups.transfer');
        Route::post('/{zaloAccount}/groups/{groupId}/poll', [ZaloController::class, 'createPoll'])->name('groups.poll');
        Route::post('/{zaloAccount}/groups/{groupId}/note', [ZaloController::class, 'createNote'])->name('groups.note');
        Route::post('/{zaloAccount}/polls/{pollId}/lock', [ZaloController::class, 'lockPoll'])->name('polls.lock');
        Route::put('/{zaloAccount}/notes/{noteId}', [ZaloController::class, 'editNote'])->name('notes.edit');
        Route::post('/{zaloAccount}/users/{userId}/alias', [ZaloController::class, 'setAlias'])->name('users.alias');
        Route::post('/{zaloAccount}/conversations/{threadId}/pin', [ZaloController::class, 'pinConversation'])->name('conversations.pin');
    });

    // Broadcasting auth endpoint
    Route::post('/broadcasting/auth', function (\Illuminate\Http\Request $request) {
        return \Illuminate\Support\Facades\Broadcast::auth($request);
    });
});
