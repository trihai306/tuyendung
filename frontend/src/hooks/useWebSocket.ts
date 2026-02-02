import { useEffect, useRef } from 'react';
import echo from '../services/echo';

export interface UseChannelOptions {
    channelName: string;
    eventName: string;
    onMessage: (data: unknown) => void;
    isPrivate?: boolean;
}

/**
 * Hook để subscribe vào một channel và lắng nghe events
 */
export function useChannel({ channelName, eventName, onMessage, isPrivate = false }: UseChannelOptions) {
    const channelRef = useRef<ReturnType<typeof echo.channel> | ReturnType<typeof echo.private> | null>(null);

    useEffect(() => {
        // Subscribe to channel
        channelRef.current = isPrivate
            ? echo.private(channelName)
            : echo.channel(channelName);

        // Listen to event
        channelRef.current.listen(eventName, (data: unknown) => {
            onMessage(data);
        });

        // Cleanup on unmount
        return () => {
            if (isPrivate) {
                echo.leaveChannel(`private-${channelName}`);
            } else {
                echo.leaveChannel(channelName);
            }
        };
    }, [channelName, eventName, onMessage, isPrivate]);

    return channelRef.current;
}

/**
 * Hook để lắng nghe nhiều events trên một channel
 */
export function useMultipleEvents(
    channelName: string,
    events: { event: string; handler: (data: unknown) => void }[],
    isPrivate = false
) {
    useEffect(() => {
        const channel = isPrivate
            ? echo.private(channelName)
            : echo.channel(channelName);

        events.forEach(({ event, handler }) => {
            channel.listen(event, handler);
        });

        return () => {
            if (isPrivate) {
                echo.leaveChannel(`private-${channelName}`);
            } else {
                echo.leaveChannel(channelName);
            }
        };
    }, [channelName, events, isPrivate]);
}

/**
 * Hook để lắng nghe presence channel (ai đang online)
 */
export function usePresenceChannel(
    channelName: string,
    callbacks: {
        onJoin?: (users: unknown[]) => void;
        onHere?: (users: unknown[]) => void;
        onLeave?: (user: unknown) => void;
    }
) {
    useEffect(() => {
        const channel = echo.join(channelName);

        if (callbacks.onHere) {
            channel.here(callbacks.onHere);
        }
        if (callbacks.onJoin) {
            channel.joining(callbacks.onJoin);
        }
        if (callbacks.onLeave) {
            channel.leaving(callbacks.onLeave);
        }

        return () => {
            echo.leaveChannel(`presence-${channelName}`);
        };
    }, [channelName, callbacks]);
}

/**
 * Export echo instance for direct use
 */
export { echo };
