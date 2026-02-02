<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PlatformAccount;
use App\Models\Channel;
use App\Services\PlatformAdapterFactory;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PlatformAccountController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $accounts = PlatformAccount::where('user_id', $request->user()->id)
            ->with('channels')
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['data' => $accounts]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'platform' => 'required|in:zalo,facebook',
            'account_name' => 'required|string|max:255',
            'access_token' => 'required|string',
            'refresh_token' => 'nullable|string',
            'token_expires_at' => 'nullable|date',
        ]);

        $account = PlatformAccount::create([
            'user_id' => $request->user()->id,
            ...$validated,
            'status' => 'active',
        ]);

        // Sync channels from platform
        // $this->syncChannels($account);

        return response()->json(['data' => $account], 201);
    }

    public function show(PlatformAccount $platformAccount): JsonResponse
    {
        $this->authorize('view', $platformAccount);

        $platformAccount->load('channels');

        return response()->json(['data' => $platformAccount]);
    }

    public function update(Request $request, PlatformAccount $platformAccount): JsonResponse
    {
        $this->authorize('update', $platformAccount);

        $validated = $request->validate([
            'account_name' => 'sometimes|string|max:255',
            'access_token' => 'sometimes|string',
            'refresh_token' => 'nullable|string',
            'status' => 'sometimes|in:active,inactive,expired',
        ]);

        $platformAccount->update($validated);

        return response()->json(['data' => $platformAccount->fresh()]);
    }

    public function destroy(PlatformAccount $platformAccount): JsonResponse
    {
        $this->authorize('delete', $platformAccount);

        $platformAccount->delete();

        return response()->json(null, 204);
    }

    public function syncChannels(PlatformAccount $platformAccount): JsonResponse
    {
        $this->authorize('update', $platformAccount);

        // TODO: Implement channel sync via platform adapter
        // $adapter = PlatformAdapterFactory::create($platformAccount);
        // $channels = $adapter->getChannels();
        // foreach ($channels as $channelData) {
        //     Channel::updateOrCreate(
        //         ['platform_account_id' => $platformAccount->id, 'channel_id' => $channelData['id']],
        //         $channelData
        //     );
        // }

        return response()->json([
            'message' => 'Đồng bộ kênh thành công.',
            'data' => $platformAccount->fresh()->channels,
        ]);
    }

    public function refreshToken(PlatformAccount $platformAccount): JsonResponse
    {
        $this->authorize('update', $platformAccount);

        // TODO: Implement token refresh via platform adapter
        // $adapter = PlatformAdapterFactory::create($platformAccount);
        // $newToken = $adapter->refreshAccessToken();
        // $platformAccount->update([
        //     'access_token' => $newToken['access_token'],
        //     'token_expires_at' => $newToken['expires_at'],
        // ]);

        return response()->json([
            'message' => 'Làm mới token thành công.',
            'data' => $platformAccount->fresh(),
        ]);
    }

    // OAuth callback handlers
    public function oauthCallback(Request $request, string $platform): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'required|string',
            'state' => 'nullable|string',
        ]);

        // TODO: Exchange code for access token
        // $adapter = PlatformAdapterFactory::createForOAuth($platform);
        // $tokenData = $adapter->exchangeCodeForToken($validated['code']);

        return response()->json([
            'message' => 'OAuth callback received.',
            'platform' => $platform,
        ]);
    }
}
