<?php

namespace App\Services\SocialMedia;

use App\Models\PlatformAccount;
use App\Models\ScheduledPost;

interface SocialPosterInterface
{
    public function post(ScheduledPost $post, PlatformAccount $account): array;
    public function validateAccount(PlatformAccount $account): bool;
}
