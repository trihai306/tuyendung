<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Events\TestNotificationEvent;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class BroadcastController extends Controller
{
    public function test(Request $request): RedirectResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        event(new TestNotificationEvent(
            userId: $user->id,
            message: 'Ket noi Soketi thanh cong! WebSocket dang hoat dong.',
        ));

        return back()->with('success', 'Da gui broadcast test thanh cong!');
    }
}
