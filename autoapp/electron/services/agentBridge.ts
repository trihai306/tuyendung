import Pusher from 'pusher-js';
import { BrowserWindow } from 'electron';
import { AuthService } from './authService';

type AgentStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

interface AgentEvent {
    event: string;
    data: Record<string, unknown>;
    timestamp: string;
}

export class AgentBridge {
    private pusher: Pusher | null = null;
    private channel: ReturnType<Pusher['subscribe']> | null = null;
    private authService: AuthService;
    private status: AgentStatus = 'disconnected';
    private reconnectTimer: NodeJS.Timeout | null = null;

    // Soketi connection config
    private soketiHost: string;
    private soketiPort: number;
    private soketiKey: string;

    constructor(authService: AuthService) {
        this.authService = authService;

        this.soketiHost = process.env.SOKETI_HOST || '127.0.0.1';
        this.soketiPort = parseInt(process.env.SOKETI_PORT || '6001', 10);
        this.soketiKey = process.env.SOKETI_KEY || 'tuyendung-key';
    }

    /**
     * Connect to Soketi and subscribe to the user's private agent channel.
     * Must be called after successful authentication.
     */
    connect(): void {
        const token = this.authService.getToken();
        const user = this.authService.getUser();

        if (!token || !user) {
            console.log('[AgentBridge] No auth token, skipping connection');
            return;
        }

        // Disconnect any existing connection
        this.disconnect();

        this.setStatus('connecting');
        console.log(`[AgentBridge] Connecting to Soketi at ${this.soketiHost}:${this.soketiPort}`);

        this.pusher = new Pusher(this.soketiKey, {
            wsHost: this.soketiHost,
            wsPort: this.soketiPort,
            wssPort: this.soketiPort,
            forceTLS: false,
            enabledTransports: ['ws', 'wss'],
            disableStats: true,
            cluster: 'mt1',
            // Auth endpoint for private channels
            authEndpoint: `${this.authService.getBaseUrl()}/api/broadcasting/auth`,
            auth: {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
            },
        });

        // Connection state handlers
        this.pusher.connection.bind('connected', () => {
            console.log('[AgentBridge] Connected to Soketi');
            this.setStatus('connected');
            this.clearReconnectTimer();
        });

        this.pusher.connection.bind('disconnected', () => {
            console.log('[AgentBridge] Disconnected from Soketi');
            this.setStatus('disconnected');
            this.scheduleReconnect();
        });

        this.pusher.connection.bind('error', (err: unknown) => {
            console.error('[AgentBridge] Connection error:', err);
            this.setStatus('error');
            this.scheduleReconnect();
        });

        // Subscribe to private agent channel
        const channelName = `private-agent.${user.id}`;
        console.log(`[AgentBridge] Subscribing to ${channelName}`);
        this.channel = this.pusher.subscribe(channelName);

        this.channel.bind('pusher:subscription_succeeded', () => {
            console.log(`[AgentBridge] Subscribed to ${channelName}`);
            this.emitToRenderer('agent:subscribed', { channel: channelName });
        });

        this.channel.bind('pusher:subscription_error', (err: unknown) => {
            console.error(`[AgentBridge] Subscription error for ${channelName}:`, err);
            this.emitToRenderer('agent:error', {
                message: 'Failed to subscribe to agent channel',
            });
        });

        // Listen for task dispatch events
        this.channel.bind('task.dispatch', (data: Record<string, unknown>) => {
            console.log('[AgentBridge] Received task.dispatch:', data);
            this.handleTaskDispatch(data);
        });

        // Listen for profile sync events
        this.channel.bind('profile.sync', (data: Record<string, unknown>) => {
            console.log('[AgentBridge] Received profile.sync:', data);
            this.emitToRenderer('agent:profile-sync', data);
        });

        // Listen for automation run events
        this.channel.bind('automation.run', (data: Record<string, unknown>) => {
            console.log('[AgentBridge] Received automation.run:', data);
            this.emitToRenderer('agent:automation-run', data);
        });

        // Listen for general command events
        this.channel.bind('command', (data: Record<string, unknown>) => {
            console.log('[AgentBridge] Received command:', data);
            this.emitToRenderer('agent:command', data);
        });
    }

    /**
     * Disconnect from Soketi and clean up.
     */
    disconnect(): void {
        this.clearReconnectTimer();

        if (this.channel) {
            this.channel.unbind_all();
            this.channel = null;
        }

        if (this.pusher) {
            this.pusher.disconnect();
            this.pusher = null;
        }

        this.setStatus('disconnected');
    }

    /**
     * Get the current connection status.
     */
    getStatus(): AgentStatus {
        return this.status;
    }

    /**
     * Handle incoming task dispatch from the backend.
     * Routes to the appropriate handler based on task type.
     */
    private async handleTaskDispatch(data: Record<string, unknown>): Promise<void> {
        const taskId = data.task_id as string;
        const taskType = data.type as string;
        const payload = data.payload as Record<string, unknown>;
        const callbackUrl = data.callback_url as string | undefined;

        this.emitToRenderer('agent:task-received', {
            taskId,
            taskType,
            payload,
        });

        // Report result back to the backend if callback_url provided
        if (callbackUrl && this.authService.getToken()) {
            try {
                await fetch(callbackUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${this.authService.getToken()}`,
                    },
                    body: JSON.stringify({
                        task_id: taskId,
                        status: 'received',
                        agent_id: `autoapp-${this.authService.getUser()?.id}`,
                        received_at: new Date().toISOString(),
                    }),
                });
            } catch (err) {
                console.error('[AgentBridge] Failed to report task receipt:', err);
            }
        }
    }

    /**
     * Schedule automatic reconnection with exponential backoff.
     */
    private scheduleReconnect(): void {
        this.clearReconnectTimer();

        if (!this.authService.isAuthenticated()) return;

        const delay = 5000; // 5 seconds
        console.log(`[AgentBridge] Scheduling reconnect in ${delay}ms`);

        this.reconnectTimer = setTimeout(() => {
            if (this.authService.isAuthenticated()) {
                this.connect();
            }
        }, delay);
    }

    private clearReconnectTimer(): void {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
    }

    private setStatus(status: AgentStatus): void {
        this.status = status;
        this.emitToRenderer('agent:status-changed', { status });
    }

    private emitToRenderer(event: string, data: Record<string, unknown>): void {
        const windows = BrowserWindow.getAllWindows();
        for (const win of windows) {
            win.webContents.send(event, data);
        }
    }
}
