import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    // Browser controls
    launchBrowser: (options?: any) => ipcRenderer.invoke('browser:launch', options),
    closeBrowser: () => ipcRenderer.invoke('browser:close'),
    navigate: (url: string) => ipcRenderer.invoke('browser:navigate', url),
    screenshot: () => ipcRenderer.invoke('browser:screenshot'),
    getContent: () => ipcRenderer.invoke('browser:getContent'),
    evaluate: (script: string) => ipcRenderer.invoke('browser:evaluate', script),

    // Human behavior actions
    click: (selector: string) => ipcRenderer.invoke('browser:click', selector),
    type: (selector: string, text: string) => ipcRenderer.invoke('browser:type', { selector, text }),
    scroll: (direction: 'up' | 'down') => ipcRenderer.invoke('browser:scroll', direction),
    waitAndClick: (selector: string, timeout?: number) =>
        ipcRenderer.invoke('browser:waitAndClick', { selector, timeout }),
    simulateReading: (duration: number) => ipcRenderer.invoke('browser:simulateReading', duration),

    // Proxy management
    loadProxies: (filePath: string) => ipcRenderer.invoke('proxy:load', filePath),
    addProxy: (proxy: any) => ipcRenderer.invoke('proxy:add', proxy),
    getProxyCount: () => ipcRenderer.invoke('proxy:count'),
});

// Type definitions for the exposed API
declare global {
    interface Window {
        electronAPI: {
            launchBrowser: (options?: any) => Promise<{ success: boolean; message?: string; error?: string }>;
            closeBrowser: () => Promise<{ success: boolean; error?: string }>;
            navigate: (url: string) => Promise<{ success: boolean; title?: string; error?: string }>;
            screenshot: () => Promise<{ success: boolean; data?: string; error?: string }>;
            getContent: () => Promise<{ success: boolean; content?: string; error?: string }>;
            evaluate: (script: string) => Promise<{ success: boolean; result?: any; error?: string }>;
            click: (selector: string) => Promise<{ success: boolean; error?: string }>;
            type: (selector: string, text: string) => Promise<{ success: boolean; error?: string }>;
            scroll: (direction: 'up' | 'down') => Promise<{ success: boolean; error?: string }>;
            waitAndClick: (selector: string, timeout?: number) => Promise<{ success: boolean; error?: string }>;
            simulateReading: (duration: number) => Promise<{ success: boolean; error?: string }>;
            loadProxies: (filePath: string) => Promise<{ success: boolean; count?: number; error?: string }>;
            addProxy: (proxy: any) => Promise<{ success: boolean; count?: number; error?: string }>;
            getProxyCount: () => Promise<{ success: boolean; count?: number }>;
        };
    }
}
