<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\InboxService;
use App\Models\Conversation;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ConversationController extends Controller
{
    public function __construct(
        private InboxService $inboxService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $conversations = $this->inboxService->getConversations(
            $request->user()->id,
            $request->only(['status', 'channel_id', 'assigned_to', 'search', 'tags']),
            $request->integer('per_page', 20)
        );

        return response()->json($conversations);
    }

    public function show(Conversation $conversation): JsonResponse
    {
        $conversation->load(['channel.platformAccount', 'assignedUser', 'candidate']);
        $conversation->markAsRead();

        return response()->json(['data' => $conversation]);
    }

    public function update(Request $request, Conversation $conversation): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'sometimes|in:open,pending,resolved,spam',
            'priority' => 'sometimes|in:low,normal,high,urgent',
            'tags' => 'sometimes|array',
        ]);

        $conversation->update($validated);

        return response()->json(['data' => $conversation->fresh()]);
    }

    public function assign(Request $request, Conversation $conversation): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $conversation = $this->inboxService->assignConversation(
            $conversation,
            $validated['user_id']
        );

        return response()->json(['data' => $conversation]);
    }

    public function messages(Conversation $conversation): JsonResponse
    {
        $messages = $this->inboxService->getMessages($conversation->id);

        return response()->json($messages);
    }

    public function sendMessage(Request $request, Conversation $conversation): JsonResponse
    {
        $validated = $request->validate([
            'content' => 'required|string|max:5000',
            'content_type' => 'sometimes|in:text,image,file',
            'attachments' => 'sometimes|array',
        ]);

        $message = $this->inboxService->sendMessage(
            $conversation,
            $validated,
            $request->user()->id
        );

        return response()->json(['data' => $message], 201);
    }

    public function createCandidate(Request $request, Conversation $conversation): JsonResponse
    {
        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'email' => 'nullable|email',
            'phone' => 'nullable|string|max:20',
        ]);

        $recruitingService = app(\App\Services\RecruitingService::class);
        $candidate = $recruitingService->createCandidateFromConversation(
            $request->user()->id,
            $conversation->id,
            $validated
        );

        $conversation->update(['candidate_id' => $candidate->id]);

        return response()->json(['data' => $candidate], 201);
    }
}
