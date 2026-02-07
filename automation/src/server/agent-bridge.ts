/**
 * Agent Bridge
 * 
 * Connects to Soketi (Pusher protocol) via pusher-js to receive
 * task dispatches from the Laravel backend. Executes tasks using
 * registered TaskHandlers and reports results back via HTTP callback.
 */

import Pusher from 'pusher-js';
import { taskRegistry, TaskPayload, TaskResult } from './task-handlers/index.js';
import { PostToGroupsHandler } from './task-handlers/post-to-groups.js';
import { ZaloHandler } from './task-handlers/zalo-handler.js';
import { zaloManager } from './services/zalo-manager.js';
import { Server as SocketIO } from 'socket.io';

interface AgentBridgeConfig {
    soketiHost: string;
    soketiPort: number;
    soketiKey: string;
    agentId: string;
    backendUrl: string; // Base URL for HTTP callbacks
}

interface ActiveTask {
    task_id: string;
    type: string;
    status: 'processing' | 'completed' | 'failed';
    started_at: string;
    completed_at?: string;
    result?: TaskResult;
}

export class AgentBridge {
    private pusher: Pusher | null = null;
    private channel: any = null;
    private config: AgentBridgeConfig;
    private io: SocketIO | null = null;
    private connected = false;
    private activeTasks = new Map<string, ActiveTask>();
    private taskHistory: ActiveTask[] = [];

    constructor(config: AgentBridgeConfig) {
        this.config = config;

        // Register built-in handlers
        taskRegistry.register(new PostToGroupsHandler());
        taskRegistry.register(new ZaloHandler());
    }

    /**
     * Set Socket.IO instance to emit events to Electron UI
     */
    setSocketIO(io: SocketIO): void {
        this.io = io;
    }

    /**
     * Connect to Soketi and start listening for tasks
     */
    connect(): void {
        console.log(`[AgentBridge] Connecting to Soketi: ${this.config.soketiHost}:${this.config.soketiPort}`);

        this.pusher = new Pusher(this.config.soketiKey, {
            wsHost: this.config.soketiHost,
            wsPort: this.config.soketiPort,
            forceTLS: false,
            enabledTransports: ['ws', 'wss'],
            disableStats: true,
            cluster: 'mt1',
        });

        // Connection state handlers
        this.pusher.connection.bind('connected', () => {
            this.connected = true;
            console.log('[AgentBridge] ✅ Connected to Soketi');
            this.emitToUI('agent:connection', { connected: true });
        });

        this.pusher.connection.bind('disconnected', () => {
            this.connected = false;
            console.log('[AgentBridge] ❌ Disconnected from Soketi');
            this.emitToUI('agent:connection', { connected: false });
        });

        this.pusher.connection.bind('error', (error: any) => {
            console.error('[AgentBridge] Connection error:', error);
            this.emitToUI('agent:connection', { connected: false, error: error?.message });
        });

        // Subscribe to agent-tasks channel
        this.channel = this.pusher.subscribe('agent-tasks');

        this.channel.bind('pusher:subscription_succeeded', () => {
            console.log('[AgentBridge] 📡 Subscribed to agent-tasks channel');
        });

        // Listen for task dispatch
        this.channel.bind('task.dispatch', (data: TaskPayload) => {
            console.log(`[AgentBridge] 📬 Received task: ${data.task_id} (${data.type})`);
            this.handleTaskDispatch(data);
        });

        // Listen for task cancellation
        this.channel.bind('task.cancel', (data: { task_id: string }) => {
            console.log(`[AgentBridge] 🚫 Cancel requested: ${data.task_id}`);
            this.handleTaskCancel(data.task_id);
        });
    }

    /**
     * Disconnect from Soketi
     */
    disconnect(): void {
        // Shutdown Zalo connections
        zaloManager.shutdown();

        if (this.pusher) {
            this.pusher.disconnect();
            this.pusher = null;
            this.channel = null;
            this.connected = false;
            console.log('[AgentBridge] Disconnected');
        }
    }

    /**
     * Handle incoming task dispatch
     */
    private async handleTaskDispatch(task: TaskPayload): Promise<void> {
        // Check if handler exists
        if (!taskRegistry.has(task.type)) {
            console.error(`[AgentBridge] No handler for task type: ${task.type}`);
            await this.reportResult(task, {
                success: false,
                error: `No handler registered for task type: ${task.type}`,
                started_at: new Date().toISOString(),
                completed_at: new Date().toISOString(),
            });
            return;
        }

        // Track active task
        const activeTask: ActiveTask = {
            task_id: task.task_id,
            type: task.type,
            status: 'processing',
            started_at: new Date().toISOString(),
        };
        this.activeTasks.set(task.task_id, activeTask);
        this.emitToUI('agent:task:started', activeTask);

        try {
            // Execute task
            const result = await taskRegistry.execute(task.type, task.payload);

            // Update tracking
            activeTask.status = result.success ? 'completed' : 'failed';
            activeTask.completed_at = new Date().toISOString();
            activeTask.result = result;

            this.emitToUI('agent:task:completed', activeTask);

            // Report back to backend
            await this.reportResult(task, result);

            console.log(`[AgentBridge] Task ${task.task_id} ${activeTask.status}`);
        } catch (error) {
            activeTask.status = 'failed';
            activeTask.completed_at = new Date().toISOString();

            const result: TaskResult = {
                success: false,
                error: (error as Error).message,
                started_at: activeTask.started_at,
                completed_at: activeTask.completed_at,
            };

            activeTask.result = result;
            this.emitToUI('agent:task:completed', activeTask);

            await this.reportResult(task, result);
            console.error(`[AgentBridge] Task ${task.task_id} failed:`, (error as Error).message);
        } finally {
            // Move to history
            this.taskHistory.push({ ...activeTask });
            this.activeTasks.delete(task.task_id);

            // Keep history limited
            if (this.taskHistory.length > 50) {
                this.taskHistory = this.taskHistory.slice(-50);
            }
        }
    }

    /**
     * Handle task cancellation
     */
    private handleTaskCancel(taskId: string): void {
        const task = this.activeTasks.get(taskId);
        if (task) {
            // TODO: Implement actual cancellation (e.g. AbortController)
            console.log(`[AgentBridge] Task ${taskId} cancellation requested (not fully implemented)`);
        }
    }

    /**
     * Report task result back to backend via HTTP
     */
    private async reportResult(task: TaskPayload, result: TaskResult): Promise<void> {
        const callbackUrl = task.callback_url || `${this.config.backendUrl}/api/agent/task-result`;

        try {
            const response = await fetch(callbackUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    task_id: task.task_id,
                    agent_id: this.config.agentId,
                    result,
                }),
            });

            if (!response.ok) {
                console.error(`[AgentBridge] Failed to report result: HTTP ${response.status}`);
            }
        } catch (error) {
            console.error(`[AgentBridge] Failed to report result:`, (error as Error).message);
        }
    }

    /**
     * Emit event to Electron UI via Socket.IO
     */
    private emitToUI(event: string, data: any): void {
        if (this.io) {
            this.io.emit(event, data);
        }
    }

    /**
     * Get bridge status
     */
    getStatus() {
        return {
            connected: this.connected,
            agent_id: this.config.agentId,
            soketi_host: `${this.config.soketiHost}:${this.config.soketiPort}`,
            registered_handlers: taskRegistry.getRegisteredTypes(),
            active_tasks: Array.from(this.activeTasks.values()),
            recent_history: this.taskHistory.slice(-10),
        };
    }

    get isConnected(): boolean {
        return this.connected;
    }
}
