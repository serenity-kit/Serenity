const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("serenityElectron", {
  setPersistedDatabase: (database) => {
    return ipcRenderer.invoke("sqlite:setPersistedDatabase", database);
  },
  getPersistedDatabase: () => ipcRenderer.invoke("sqlite:getPersistedDatabase"),
  deletePersistedDatabase: () =>
    ipcRenderer.invoke("sqlite:deletePersistedDatabase"),
  isSafeStorageAvailable: () => ipcRenderer.invoke("safeStorage:isAvailable"),
});
