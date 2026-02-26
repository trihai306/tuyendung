import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

/**
 * Echo + Pusher -- Soketi WebSocket Integration
 *
 * Connect via Herd's Nginx WSS proxy (tuyendung.test/app/*)
 * so the browser can use secure WebSocket from HTTPS pages.
 * Nginx proxies /app/* to Soketi at 127.0.0.1:6001.
 */
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    wsHost: window.location.hostname,
    wsPort: 443,
    wssPort: 443,
    forceTLS: true,
    disableStats: true,
    enabledTransports: ['ws', 'wss'],
    cluster: 'mt1',
});
