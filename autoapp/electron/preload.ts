import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('autoApp', {
    // Window controls
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close: () => ipcRenderer.send('window:close'),

    // Auth
    login: (email: string, password: string) => ipcRenderer.invoke('auth:login', email, password),
    logout: () => ipcRenderer.invoke('auth:logout'),
    getUser: () => ipcRenderer.invoke('auth:getUser'),
    getAuthStatus: () => ipcRenderer.invoke('auth:status'),
    verifyAuth: () => ipcRenderer.invoke('auth:verify'),

    // Agent Bridge
    getAgentStatus: () => ipcRenderer.invoke('agent:status'),
    reconnectAgent: () => ipcRenderer.invoke('agent:reconnect'),

    // Profile management
    getProfiles: () => ipcRenderer.invoke('profiles:getAll'),
    getProfile: (id: string) => ipcRenderer.invoke('profiles:get', id),
    createProfile: (data: any) => ipcRenderer.invoke('profiles:create', data),
    updateProfile: (id: string, data: any) => ipcRenderer.invoke('profiles:update', id, data),
    deleteProfile: (id: string) => ipcRenderer.invoke('profiles:delete', id),

    // Browser management
    launchBrowser: (profileId: string) => ipcRenderer.invoke('browser:launch', profileId),
    closeBrowser: (profileId: string) => ipcRenderer.invoke('browser:close', profileId),
    getActiveBrowsers: () => ipcRenderer.invoke('browser:getActive'),
    getBrowserStatus: (profileId: string) => ipcRenderer.invoke('browser:status', profileId),

    // Automation
    getAutomations: () => ipcRenderer.invoke('automation:getAll'),
    createAutomation: (data: any) => ipcRenderer.invoke('automation:create', data),
    updateAutomation: (id: string, data: any) => ipcRenderer.invoke('automation:update', id, data),
    deleteAutomation: (id: string) => ipcRenderer.invoke('automation:delete', id),
    runAutomation: (id: string, profileId: string) => ipcRenderer.invoke('automation:run', id, profileId),
    stopAutomation: (id: string) => ipcRenderer.invoke('automation:stop', id),

    // Logs
    getLogs: (limit?: number) => ipcRenderer.invoke('logs:getAll', limit),
    clearLogs: () => ipcRenderer.invoke('logs:clear'),

    // Events
    onBrowserEvent: (callback: (event: any) => void) => {
        const handler = (_: any, data: any) => callback(data);
        ipcRenderer.on('browser:event', handler);
        return () => ipcRenderer.removeListener('browser:event', handler);
    },
    onLogEvent: (callback: (log: any) => void) => {
        const handler = (_: any, data: any) => callback(data);
        ipcRenderer.on('log:new', handler);
        return () => ipcRenderer.removeListener('log:new', handler);
    },
    onAuthChanged: (callback: (data: any) => void) => {
        const handler = (_: any, data: any) => callback(data);
        ipcRenderer.on('auth:changed', handler);
        return () => ipcRenderer.removeListener('auth:changed', handler);
    },
    onAgentStatus: (callback: (data: any) => void) => {
        const handler = (_: any, data: any) => callback(data);
        ipcRenderer.on('agent:status-changed', handler);
        return () => ipcRenderer.removeListener('agent:status-changed', handler);
    },
    onAgentEvent: (callback: (event: string, data: any) => void) => {
        const events = ['agent:task-received', 'agent:profile-sync', 'agent:automation-run', 'agent:command', 'agent:subscribed', 'agent:error'];
        const handlers = events.map(evt => {
            const handler = (_: any, data: any) => callback(evt, data);
            ipcRenderer.on(evt, handler);
            return { evt, handler };
        });
        return () => {
            for (const { evt, handler } of handlers) {
                ipcRenderer.removeListener(evt, handler);
            }
        };
    },
});
