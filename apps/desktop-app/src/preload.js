const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("serenityElectron", {
  setDatabase: (database) => ipcRenderer.invoke("sqlite:setDatabase", database),
  getDatabase: () => ipcRenderer.invoke("sqlite:getDatabase"),
});
