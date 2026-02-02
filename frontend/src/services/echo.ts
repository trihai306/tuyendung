import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Make Pusher available globally for Laravel Echo
declare global {
    interface Window {
        Pusher: typeof Pusher;
        Echo: Echo<'pusher'>;
    }
}

window.Pusher = Pusher;

// Create Laravel Echo instance
let echo: Echo<'pusher'> | null = null;

/**
 * Initialize Echo with auth token for private channels
 */
export function initEcho(token?: string): Echo<'pusher'> {
    if (echo) {
        return echo;
    }

    echo = new Echo({
        broadcaster: 'pusher',
        key: import.meta.env.VITE_PUSHER_APP_KEY || 'recruitment-key',
        wsHost: import.meta.env.VITE_PUSHER_HOST || 'localhost',
        wsPort: parseInt(import.meta.env.VITE_PUSHER_PORT || '6001'),
        wssPort: parseInt(import.meta.env.VITE_PUSHER_PORT || '6001'),
        forceTLS: import.meta.env.VITE_PUSHER_SCHEME === 'https',
        encrypted: import.meta.env.VITE_PUSHER_SCHEME === 'https',
        disableStats: true,
        enabledTransports: ['ws', 'wss'],
        cluster: 'mt1',
        authEndpoint: `${import.meta.env.VITE_API_URL}/broadcasting/auth`,
        auth: {
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        },
    });

    window.Echo = echo;
    return echo;
}

/**
 * Get Echo instance (creates one if not exists)
 */
export function getEcho(): Echo<'pusher'> {
    if (!echo) {
        return initEcho();
    }
    return echo;
}

export default getEcho();
