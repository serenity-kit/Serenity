const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("serenityElectron", {
  setDocument: (document) => ipcRenderer.invoke("sqlite:setDocument", document),
  getDocument: (documentId) =>
    ipcRenderer.invoke("sqlite:getDocument", documentId),
});
