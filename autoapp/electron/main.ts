import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { ProfileManager } from './services/profileManager';
import { BrowserManager } from './services/browserManager';
import { AutomationEngine } from './services/automationEngine';
import { AuthService } from './services/authService';
import { AgentBridge } from './services/agentBridge';
import { setupIPC } from './ipc';

let mainWindow: BrowserWindow | null = null;
const profileManager = new ProfileManager();
const browserManager = new BrowserManager(profileManager);
const automationEngine = new AutomationEngine(browserManager, profileManager);
const authService = new AuthService();
const agentBridge = new AgentBridge(authService);

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1000,
        minHeight: 700,
        frame: false,
        titleBarStyle: 'hiddenInset',
        backgroundColor: '#030712',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    // Dev or production
    if (process.env.VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(async () => {
    createWindow();
    setupIPC(profileManager, browserManager, automationEngine, authService, agentBridge);

    // Window controls
    ipcMain.on('window:minimize', () => mainWindow?.minimize());
    ipcMain.on('window:maximize', () => {
        if (mainWindow?.isMaximized()) {
            mainWindow.unmaximize();
        } else {
            mainWindow?.maximize();
        }
    });
    ipcMain.on('window:close', () => mainWindow?.close());

    // Auto-connect to Soketi if already authenticated
    if (authService.isAuthenticated()) {
        const user = await authService.verifyToken();
        if (user) {
            agentBridge.connect();
        }
    }
});

app.on('window-all-closed', () => {
    agentBridge.disconnect();
    browserManager.closeAll();
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
