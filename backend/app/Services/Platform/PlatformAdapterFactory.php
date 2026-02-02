<?php

namespace App\Services\Platform;

use App\Models\PlatformAccount;
use InvalidArgumentException;

class PlatformAdapterFactory
{
    /**
     * Create adapter for existing platform account
     */
    public static function create(PlatformAccount $account): PlatformAdapterInterface
    {
        return match ($account->platform) {
            'zalo' => new ZaloAdapter($account),
            'facebook' => new FacebookAdapter($account),
            default => throw new InvalidArgumentException("Unsupported platform: {$account->platform}"),
        };
    }

    /**
     * Get supported platforms
     */
    public static function getSupportedPlatforms(): array
    {
        return ['zalo', 'facebook'];
    }

    /**
     * Check if platform is supported
     */
    public static function isSupported(string $platform): bool
    {
        return in_array($platform, self::getSupportedPlatforms());
    }
}
