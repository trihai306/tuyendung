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
use App\Http\Controllers\Api\JobAssignmentController;
use App\Http\Controllers\Api\ZaloWebhookController;
use App\Http\Controllers\Api\JobAlertController;
use App\Http\Controllers\Api\CalendarController;
use App\Http\Controllers\Api\ScheduledGroupPostController;
use App\Http\Controllers\Api\FacebookGroupController;
use App\Http\Controllers\Api\AgentTaskController;

// Public routes
Route::prefix('auth')->name('auth.')->group(function () {
    Route::post('/register', [AuthController::class, 'register'])->name('register');
    Route::post('/register/candidate', [AuthController::class, 'registerCandidate'])->name('register.candidate');
    Route::post('/login', [AuthController::class, 'login'])->name('login');
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->name('forgot-password');
});

// Public packages route
Route::get('/packages', [PackageController::class, 'index'])->name('packages.index');
Route::get('/packages/{slug}', [PackageController::class, 'show'])->name('packages.show');

// Public jobs route (for unauthenticated users)
Route::get('/public/jobs', [JobController::class, 'publicIndex'])->name('jobs.public.index');
Route::get('/public/jobs/{slug}', [JobController::class, 'publicShow'])->name('jobs.public.show');


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

// Agent task result callback (called by automation app, no auth)
Route::post('/agent/task-result', [AgentTaskController::class, 'receiveResult'])
    ->name('agent.task-result');

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

    // Notifications
    Route::prefix('notifications')->name('notifications.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Api\NotificationController::class, 'index'])->name('index');
        Route::get('/recent', [\App\Http\Controllers\Api\NotificationController::class, 'recent'])->name('recent');
        Route::get('/unread-count', [\App\Http\Controllers\Api\NotificationController::class, 'unreadCount'])->name('unread-count');
        Route::post('/{id}/read', [\App\Http\Controllers\Api\NotificationController::class, 'markAsRead'])->name('read');
        Route::post('/read-all', [\App\Http\Controllers\Api\NotificationController::class, 'markAllAsRead'])->name('read-all');
        Route::delete('/{id}', [\App\Http\Controllers\Api\NotificationController::class, 'destroy'])->name('destroy');
    });

    // Jobs
    Route::get('/jobs/trashed', [JobController::class, 'trashed'])->name('jobs.trashed');
    Route::get('/jobs/expired', [JobController::class, 'expired'])->name('jobs.expired');
    Route::apiResource('jobs', JobController::class);
    Route::post('/jobs/{job}/publish', [JobController::class, 'publish'])->name('jobs.publish');
    Route::post('/jobs/{job}/close', [JobController::class, 'close'])->name('jobs.close');
    Route::post('/jobs/{id}/restore', [JobController::class, 'restore'])->name('jobs.restore');
    Route::delete('/jobs/{id}/force', [JobController::class, 'forceDelete'])->name('jobs.force-delete');
    Route::post('/jobs/{job}/renew', [JobController::class, 'renewJob'])->name('jobs.renew');
    Route::get('/jobs/{job}/pipeline', [JobController::class, 'pipeline'])->name('jobs.pipeline');

    // Job Alerts
    Route::get('/jobs/alerts', [JobAlertController::class, 'index'])->name('jobs.alerts');
    Route::get('/jobs/alerts/summary', [JobAlertController::class, 'summary'])->name('jobs.alerts.summary');

    // Job Assignments
    Route::get('/jobs/{job}/assignments', [JobAssignmentController::class, 'index'])->name('jobs.assignments.index');
    Route::post('/jobs/{job}/assignments', [JobAssignmentController::class, 'assign'])->name('jobs.assignments.assign');
    Route::get('/my-assignments', [JobAssignmentController::class, 'myAssignments'])->name('assignments.mine');
    Route::patch('/assignments/{assignment}', [JobAssignmentController::class, 'updateProgress'])->name('assignments.update');
    Route::delete('/assignments/{assignment}', [JobAssignmentController::class, 'destroy'])->name('assignments.destroy');

    // Applications
    Route::patch('/applications/{application}/move-stage', [JobController::class, 'moveStage'])->name('applications.move');

    // Candidates
    Route::apiResource('candidates', CandidateController::class);
    Route::post('/candidates/{candidate}/apply', [CandidateController::class, 'applyToJob'])->name('candidates.apply');
    Route::post('/candidates/{candidate}/assign', [CandidateController::class, 'assign'])->name('candidates.assign');
    Route::post('/candidates/bulk-assign', [CandidateController::class, 'bulkAssign'])->name('candidates.bulk-assign');

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

    // Calendar
    Route::prefix('calendar')->name('calendar.')->group(function () {
        Route::get('/events', [CalendarController::class, 'events'])->name('events');
    });

    // Task Management
    Route::prefix('tasks')->name('tasks.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Api\TaskController::class, 'index'])->name('index');
        Route::get('/stats', [\App\Http\Controllers\Api\TaskController::class, 'stats'])->name('stats');
        Route::get('/employees', [\App\Http\Controllers\Api\TaskController::class, 'employees'])->name('employees');
        Route::post('/', [\App\Http\Controllers\Api\TaskController::class, 'store'])->name('store');
        Route::get('/{task}', [\App\Http\Controllers\Api\TaskController::class, 'show'])->name('show');
        Route::put('/{task}', [\App\Http\Controllers\Api\TaskController::class, 'update'])->name('update');
        Route::patch('/{task}/progress', [\App\Http\Controllers\Api\TaskController::class, 'updateProgress'])->name('progress');
        Route::post('/{task}/comments', [\App\Http\Controllers\Api\TaskController::class, 'addComment'])->name('comments');
        Route::delete('/{task}', [\App\Http\Controllers\Api\TaskController::class, 'destroy'])->name('destroy');
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
        Route::post('/{zaloAccount}/groups/leave', [ZaloController::class, 'leaveGroup'])->name('groups.leave');
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

        // Complete zca-js API coverage
        Route::post('/{zaloAccount}/groups/{groupId}/avatar', [ZaloController::class, 'changeGroupAvatar'])->name('groups.avatar');
        Route::get('/{zaloAccount}/stickers/{stickerType}', [ZaloController::class, 'getStickersDetail'])->name('stickers.detail');
        Route::post('/{zaloAccount}/report', [ZaloController::class, 'sendReport'])->name('report');
        Route::post('/{zaloAccount}/undo-message', [ZaloController::class, 'undoMessage'])->name('undo-message');
    });

    // Scheduled Group Posts (Zalo group automation)
    Route::prefix('scheduled-group-posts')->name('scheduled-group-posts.')->group(function () {
        Route::get('/', [ScheduledGroupPostController::class, 'index'])->name('index');
        Route::post('/', [ScheduledGroupPostController::class, 'store'])->name('store');
        Route::get('/available-groups', [ScheduledGroupPostController::class, 'availableGroups'])->name('available-groups');
        Route::get('/{scheduledGroupPost}', [ScheduledGroupPostController::class, 'show'])->name('show');
        Route::put('/{scheduledGroupPost}', [ScheduledGroupPostController::class, 'update'])->name('update');
        Route::delete('/{scheduledGroupPost}', [ScheduledGroupPostController::class, 'destroy'])->name('destroy');
        Route::post('/{scheduledGroupPost}/approve', [ScheduledGroupPostController::class, 'approve'])->name('approve');
        Route::post('/{scheduledGroupPost}/execute-now', [ScheduledGroupPostController::class, 'executeNow'])->name('execute-now');
    });

    // Facebook Groups Management
    Route::prefix('facebook-groups')->name('facebook-groups.')->group(function () {
        Route::get('/', [FacebookGroupController::class, 'index'])->name('index');
        Route::post('/sync', [FacebookGroupController::class, 'sync'])->name('sync');
        Route::get('/{facebookGroup}', [FacebookGroupController::class, 'show'])->name('show');
        Route::put('/{facebookGroup}', [FacebookGroupController::class, 'update'])->name('update');
        Route::post('/{facebookGroup}/post', [FacebookGroupController::class, 'post'])->name('post');
        Route::get('/{facebookGroup}/members', [FacebookGroupController::class, 'members'])->name('members');
        Route::get('/{facebookGroup}/pending-members', [FacebookGroupController::class, 'pendingMembers'])->name('pending-members');
        Route::post('/{facebookGroup}/approve-member', [FacebookGroupController::class, 'approveMember'])->name('approve-member');
    });

    // Broadcasting auth endpoint
    Route::post('/broadcasting/auth', function (\Illuminate\Http\Request $request) {
        return \Illuminate\Support\Facades\Broadcast::auth($request);
    });

    // Agent Tasks
    Route::prefix('agent')->name('agent.')->group(function () {
        Route::get('/tasks', [AgentTaskController::class, 'index'])->name('tasks.index');
        Route::post('/dispatch', [AgentTaskController::class, 'dispatch'])->name('dispatch');
        Route::get('/tasks/{agentTask}', [AgentTaskController::class, 'show'])->name('tasks.show');
    });
});
