const { app, BrowserWindow } = require("electron");
const path = require("path");

const isDevelopment = process.env.NODE_ENV !== "production";

// handle creating/removing shortcuts on Windows when installing/uninstalling
if (require("electron-squirrel-startup")) {
  app.quit();
}

const createWindow = () => {
  // create the browser window
  const mainWindow = new BrowserWindow({
    webPreferences: {},
  });
  // take up the full screen
  mainWindow.maximize();
  mainWindow.show();

  if (isDevelopment) {
    mainWindow.loadURL(`http://localhost:19006`);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "web-build", "index.html"));
  }
};

// this method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs
app.on("ready", createWindow);

// wuit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // on OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
