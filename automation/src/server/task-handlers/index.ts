/**
 * Task Handler Registry
 * 
 * Extensible system for registering and executing automation tasks.
 * Each handler implements the TaskHandler interface and is registered by type.
 */

export type TaskType = 'post_to_groups' | 'login_account' | 'scrape_data' | 'zalo_command' | 'custom';

export interface TaskPayload {
    task_id: string;
    type: TaskType;
    payload: Record<string, any>;
    callback_url: string;
    company_id?: number;
}

export interface TaskResult {
    success: boolean;
    data?: Record<string, any>;
    error?: string;
    started_at: string;
    completed_at: string;
}

export interface TaskHandler {
    type: TaskType;
    execute(payload: Record<string, any>): Promise<TaskResult>;
}

class TaskHandlerRegistry {
    private handlers = new Map<string, TaskHandler>();

    register(handler: TaskHandler): void {
        this.handlers.set(handler.type, handler);
        console.log(`[TaskRegistry] Registered handler: ${handler.type}`);
    }

    has(type: string): boolean {
        return this.handlers.has(type);
    }

    async execute(type: string, payload: Record<string, any>): Promise<TaskResult> {
        const handler = this.handlers.get(type);
        if (!handler) {
            return {
                success: false,
                error: `No handler registered for task type: ${type}`,
                started_at: new Date().toISOString(),
                completed_at: new Date().toISOString(),
            };
        }

        const startedAt = new Date().toISOString();
        try {
            const result = await handler.execute(payload);
            return {
                ...result,
                started_at: startedAt,
                completed_at: new Date().toISOString(),
            };
        } catch (error) {
            return {
                success: false,
                error: (error as Error).message,
                started_at: startedAt,
                completed_at: new Date().toISOString(),
            };
        }
    }

    getRegisteredTypes(): string[] {
        return Array.from(this.handlers.keys());
    }
}

export const taskRegistry = new TaskHandlerRegistry();
