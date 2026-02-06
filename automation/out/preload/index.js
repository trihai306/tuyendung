"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  // Browser controls
  launchBrowser: (options) => electron.ipcRenderer.invoke("browser:launch", options),
  closeBrowser: () => electron.ipcRenderer.invoke("browser:close"),
  navigate: (url) => electron.ipcRenderer.invoke("browser:navigate", url),
  screenshot: () => electron.ipcRenderer.invoke("browser:screenshot"),
  getContent: () => electron.ipcRenderer.invoke("browser:getContent"),
  evaluate: (script) => electron.ipcRenderer.invoke("browser:evaluate", script),
  // Human behavior actions
  click: (selector) => electron.ipcRenderer.invoke("browser:click", selector),
  type: (selector, text) => electron.ipcRenderer.invoke("browser:type", { selector, text }),
  scroll: (direction) => electron.ipcRenderer.invoke("browser:scroll", direction),
  waitAndClick: (selector, timeout) => electron.ipcRenderer.invoke("browser:waitAndClick", { selector, timeout }),
  simulateReading: (duration) => electron.ipcRenderer.invoke("browser:simulateReading", duration),
  // Proxy management
  loadProxies: (filePath) => electron.ipcRenderer.invoke("proxy:load", filePath),
  addProxy: (proxy) => electron.ipcRenderer.invoke("proxy:add", proxy),
  getProxyCount: () => electron.ipcRenderer.invoke("proxy:count")
});
