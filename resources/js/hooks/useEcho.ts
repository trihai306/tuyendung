import { useEffect, useRef, useCallback } from 'react';
import type { Channel } from 'laravel-echo';

/**
 * Subscribe to a public channel. Auto-cleanup on unmount.
 */
export function useChannel(channelName: string): Channel | null {
    const channelRef = useRef<Channel | null>(null);

    useEffect(() => {
        if (!window.Echo) return;

        channelRef.current = window.Echo.channel(channelName);

        return () => {
            window.Echo.leaveChannel(channelName);
            channelRef.current = null;
        };
    }, [channelName]);

    return channelRef.current;
}

/**
 * Subscribe to a private channel. Auto-cleanup on unmount.
 */
export function usePrivateChannel(channelName: string): Channel | null {
    const channelRef = useRef<Channel | null>(null);

    useEffect(() => {
        if (!window.Echo) return;

        channelRef.current = window.Echo.private(channelName);

        return () => {
            window.Echo.leaveChannel(`private-${channelName}`);
            channelRef.current = null;
        };
    }, [channelName]);

    return channelRef.current;
}

/**
 * Listen to an event on a private channel. Auto-cleanup on unmount.
 * Event name should include leading dot for custom broadcastAs events.
 *
 * @example
 * useListen<{ message: string }>('user.1', '.notification.test', (data) => {
 *     console.log(data.message);
 * });
 */
export function useListen<T = Record<string, unknown>>(
    channelName: string,
    eventName: string,
    callback: (data: T) => void,
): void {
    const callbackRef = useRef(callback);
    callbackRef.current = callback;

    const stableCallback = useCallback((data: T) => {
        callbackRef.current(data);
    }, []);

    useEffect(() => {
        if (!window.Echo) return;

        const channel = window.Echo.private(channelName);
        channel.listen(eventName, stableCallback);

        return () => {
            channel.stopListening(eventName, stableCallback);
        };
    }, [channelName, eventName, stableCallback]);
}
