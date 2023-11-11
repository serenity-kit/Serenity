const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("serenityElectron", {
  setPersistedDatabase: (database) => {
    return ipcRenderer.invoke("sqlite:setPersistedDatabase", database);
  },
  getPersistedDatabase: () => ipcRenderer.invoke("sqlite:getPersistedDatabase"),
  deletePersistedDatabase: () =>
    ipcRenderer.invoke("sqlite:deletePersistedDatabase"),
  isSafeStorageAvailable: () => ipcRenderer.invoke("safeStorage:isAvailable"),
  setSessionKey: (key) => ipcRenderer.invoke("safeStorage:setSessionKey", key),
  getSessionKey: () => ipcRenderer.invoke("safeStorage:getSessionKey"),
  deleteSessionKey: () => ipcRenderer.invoke("safeStorage:deleteSessionKey"),
  setDevice: (device) => ipcRenderer.invoke("safeStorage:setDevice", device),
  getDevice: () => ipcRenderer.invoke("safeStorage:getDevice"),
  deleteDevice: () => ipcRenderer.invoke("safeStorage:deleteDevice"),
});
