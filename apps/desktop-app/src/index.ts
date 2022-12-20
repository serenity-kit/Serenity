const electron = require("electron");
const path = require("path");
const fs = require("fs");
const { promisify } = require("util");
const sqlite3Import = require("sqlite3");

const sqliteDbPath = path.join(electron.app.getPath("userData"), "serenity.db");
console.log("Serenity sqlite DbPath:", sqliteDbPath);
const isDevelopment = process.env.NODE_ENV === "development";

const sqlite3 = isDevelopment ? sqlite3Import.verbose() : sqlite3Import;
const db = new sqlite3.Database(sqliteDbPath);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS "Document" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" BLOB
  );`);
});

const asyncDb = {
  get: promisify(db.get.bind(db)),
};

// see https://cs.chromium.org/chromium/src/net/base/net_error_list.h
const FILE_NOT_FOUND = -6;
const { app, BrowserWindow, ipcMain } = electron;
const fsStat = promisify(fs.stat);
const scheme = "serenity-desktop";
const root = "app";

const serve = (rootDirectoryPath) => {
  electron.protocol.registerSchemesAsPrivileged([
    {
      scheme,
      privileges: {
        standard: true,
        secure: true,
        allowServiceWorkers: true,
        supportFetchAPI: true,
        corsEnabled: true,
      },
    },
  ]);

  const absoluteDirectoryPath = path.resolve(
    electron.app.getAppPath(),
    rootDirectoryPath
  );

  electron.app.on("ready", () => {
    electron.session.defaultSession.protocol.registerFileProtocol(
      scheme,
      async (request, callback) => {
        const indexPath = path.join(absoluteDirectoryPath, "index.html");
        const filePath = path.join(
          absoluteDirectoryPath,
          decodeURIComponent(new URL(request.url).pathname)
        );
        const fileStat = await fsStat(filePath);

        const fileExtension = path.extname(filePath);

        if (fileStat.isFile()) {
          callback({
            path: filePath,
          });
        } else if (!fileExtension) {
          callback({
            path: indexPath,
          });
        } else {
          callback({ error: FILE_NOT_FOUND });
        }
      }
    );
  });
};

if (!isDevelopment) {
  serve(path.join("src", "web-build"));
}

// handle creating/removing shortcuts on Windows when installing/uninstalling
if (require("electron-squirrel-startup")) {
  app.quit();
}

const createWindow = async () => {
  // create the browser window
  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });
  // take up the full screen
  mainWindow.maximize();
  mainWindow.show();

  if (isDevelopment) {
    mainWindow.loadURL(`http://localhost:19006`);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadURL(`${scheme}://${root}`);
    // mainWindow.webContents.openDevTools();
  }
};

// this method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs
app.on("ready", () => {
  ipcMain.handle("sqlite:setDocument", (event, document) => {
    db.run(`REPLACE INTO "Document" VALUES (?, ?)`, [
      document.id,
      document.content,
    ]);
    return true;
  });

  ipcMain.handle("sqlite:getDocument", (event, documentId) => {
    return asyncDb.get(`SELECT * FROM "Document" WHERE id = ?`, documentId);
  });

  createWindow();
});

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