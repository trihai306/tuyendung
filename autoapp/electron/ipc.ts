import { ipcMain } from 'electron';
import { ProfileManager } from './services/profileManager';
import { BrowserManager } from './services/browserManager';
import { AutomationEngine } from './services/automationEngine';
import { AuthService } from './services/authService';
import { AgentBridge } from './services/agentBridge';

export function setupIPC(
    profileManager: ProfileManager,
    browserManager: BrowserManager,
    automationEngine: AutomationEngine,
    authService: AuthService,
    agentBridge: AgentBridge,
): void {
    // --- Auth ---
    ipcMain.handle('auth:login', async (_, email: string, password: string) => {
        try {
            const result = await authService.login(email, password);
            // Connect to Soketi after successful login
            agentBridge.connect();
            return { success: true, user: result.user };
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            return { success: false, error: message };
        }
    });

    ipcMain.handle('auth:logout', async () => {
        agentBridge.disconnect();
        await authService.logout();
        return { success: true };
    });

    ipcMain.handle('auth:getUser', () => {
        return authService.getUser();
    });

    ipcMain.handle('auth:status', () => {
        return {
            isAuthenticated: authService.isAuthenticated(),
            user: authService.getUser(),
        };
    });

    ipcMain.handle('auth:verify', async () => {
        const user = await authService.verifyToken();
        if (user) {
            // Ensure Soketi is connected
            if (agentBridge.getStatus() === 'disconnected') {
                agentBridge.connect();
            }
        }
        return user;
    });

    // --- Agent Bridge ---
    ipcMain.handle('agent:status', () => {
        return { status: agentBridge.getStatus() };
    });

    ipcMain.handle('agent:reconnect', () => {
        if (authService.isAuthenticated()) {
            agentBridge.connect();
            return { success: true };
        }
        return { success: false, error: 'Not authenticated' };
    });

    // --- Profiles ---
    ipcMain.handle('profiles:getAll', () => profileManager.getAll());
    ipcMain.handle('profiles:get', (_, id: string) => profileManager.get(id));
    ipcMain.handle('profiles:create', (_, data) => profileManager.create(data));
    ipcMain.handle('profiles:update', (_, id: string, data) => profileManager.update(id, data));
    ipcMain.handle('profiles:delete', async (_, id: string) => {
        if (browserManager.isRunning(id)) {
            await browserManager.close(id);
        }
        return profileManager.delete(id);
    });

    // --- Browser ---
    ipcMain.handle('browser:launch', (_, profileId: string) => browserManager.launch(profileId));
    ipcMain.handle('browser:close', (_, profileId: string) => browserManager.close(profileId));
    ipcMain.handle('browser:getActive', () => browserManager.getActive());
    ipcMain.handle('browser:status', (_, profileId: string) => browserManager.isRunning(profileId));

    // --- Automations ---
    ipcMain.handle('automation:getAll', () => automationEngine.getAll());
    ipcMain.handle('automation:create', (_, data) => automationEngine.create(data));
    ipcMain.handle('automation:update', (_, id: string, data) => automationEngine.update(id, data));
    ipcMain.handle('automation:delete', (_, id: string) => automationEngine.delete(id));
    ipcMain.handle('automation:run', (_, id: string, profileId: string) => automationEngine.run(id, profileId));
    ipcMain.handle('automation:stop', (_, id: string) => {
        automationEngine.stop(id);
        return true;
    });

    // --- Logs ---
    ipcMain.handle('logs:getAll', (_, limit?: number) => automationEngine.getLogs(limit));
    ipcMain.handle('logs:clear', () => {
        automationEngine.clearLogs();
        return true;
    });
}
