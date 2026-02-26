<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

Broadcast::channel('user.{id}', function ($user, int $id): bool {
    return $user->id === $id;
});

// AutoApp agent channel - each user gets their own agent channel
Broadcast::channel('agent.{id}', function ($user, int $id): bool {
    return $user->id === $id;
});
