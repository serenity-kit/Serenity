const electron = require("electron");
const path = require("path");
const fs = require("fs");
const { promisify } = require("util");
const sodium = require("libsodium-wrappers");

const userDataPath = electron.app.getPath("userData");
const sqliteDbPath = path.join(userDataPath, "serenity.encrypted.db");
const sqliteDbKeyAndNoncePath = path.join(
  userDataPath,
  "serenity.db-key-and-nonce.txt"
);
const sessionKeyPath = path.join(
  userDataPath,
  "serenity.encrypted-session-key.txt"
);
const devicePath = path.join(userDataPath, "serenity.encrypted-device.txt");

console.log("Serenity sqlite DbPath:", sqliteDbPath);

const isDevelopment = process.env.NODE_ENV === "development";

// see https://cs.chromium.org/chromium/src/net/base/net_error_list.h
const FILE_NOT_FOUND = -6;
const { app, BrowserWindow, ipcMain } = electron;
const fsStat = promisify(fs.stat);
const fsWriteFile = promisify(fs.writeFile);
const fsReadFile = promisify(fs.readFile);
const fsUnlink = promisify(fs.unlink);
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

  console.log("LLLLKKK", app.setUserActivity, typeof app.setUserActivity);
  setTimeout(() => {
    console.log("PPPP");
    app.setUserActivity("NSUserActivityTypeBrowsingWeb", {
      type: "com.serenityapp.desktop",
      userInfo: { test: "test" },
    });
  }, 3000);
};

// this method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs
app.on("ready", () => {
  ipcMain.handle("sqlite:setPersistedDatabase", async (event, database) => {
    try {
      if (electron.safeStorage.isEncryptionAvailable()) {
        await sodium.ready;
        let key = new Uint8Array();
        let nonce = new Uint8Array();
        try {
          await fsUnlink(sqliteDbPath);
          const encryptedKeyAndNonce = await fsReadFile(
            sqliteDbKeyAndNoncePath
          );
          if (!encryptedKeyAndNonce) throw new Error("No key and nonce");
          const decryptedData = JSON.parse(
            electron.safeStorage.decryptString(encryptedKeyAndNonce)
          );
          key = sodium.from_base64(decryptedData.key);
          nonce = sodium.from_base64(decryptedData.nonce);
        } catch (err) {
          key = sodium.randombytes_buf(sodium.crypto_secretbox_KEYBYTES);
          nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
          const encryptedKeyAndNonce = electron.safeStorage.encryptString(
            JSON.stringify({
              key: sodium.to_base64(key),
              nonce: sodium.to_base64(nonce),
            })
          );

          await fsWriteFile(sqliteDbKeyAndNoncePath, encryptedKeyAndNonce);
        }

        const encryptedDatabase = sodium.crypto_secretbox_easy(
          database,
          nonce,
          key
        );

        return fsWriteFile(sqliteDbPath, Buffer.from(encryptedDatabase));
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  });

  ipcMain.handle("sqlite:getPersistedDatabase", async (event) => {
    try {
      await sodium.ready;
      const encryptedKeyAndNonce = await fsReadFile(sqliteDbKeyAndNoncePath);
      if (encryptedKeyAndNonce) {
        const decryptedData = JSON.parse(
          electron.safeStorage.decryptString(encryptedKeyAndNonce)
        );
        const key = sodium.from_base64(decryptedData.key);
        const nonce = sodium.from_base64(decryptedData.nonce);
        const data = await fsReadFile(sqliteDbPath);
        const decryptedDatabase = sodium.crypto_secretbox_open_easy(
          data,
          nonce,
          key
        );
        return new Uint8Array(
          decryptedDatabase.buffer,
          decryptedDatabase.byteOffset,
          decryptedDatabase.byteLength
        );
      }
    } catch (err) {
      console.error(err);
      return undefined;
    }
  });

  ipcMain.handle("sqlite:deletePersistedDatabase", async (event) => {
    try {
      await Promise.all([
        fsUnlink(sqliteDbKeyAndNoncePath),
        fsUnlink(sqliteDbPath),
      ]);
      return true;
    } catch (err) {
      return false;
    }
  });

  ipcMain.handle("safeStorage:isAvailable", async (event) => {
    return electron.safeStorage.isEncryptionAvailable();
  });

  ipcMain.handle("safeStorage:setSessionKey", async (event, keys) => {
    try {
      if (electron.safeStorage.isEncryptionAvailable()) {
        const encryptedKey = electron.safeStorage.encryptString(keys);
        await fsWriteFile(sessionKeyPath, encryptedKey);
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  });

  ipcMain.handle("safeStorage:getSessionKey", async (event) => {
    try {
      const encryptedKey = await fsReadFile(sessionKeyPath);
      if (!encryptedKey) throw new Error("No sessionKey");
      return electron.safeStorage.decryptString(encryptedKey);
    } catch (err) {
      return undefined;
    }
  });

  ipcMain.handle("safeStorage:deleteSessionKey", async (event) => {
    try {
      await fsUnlink(sessionKeyPath);
      return true;
    } catch (err) {
      return false;
    }
  });

  ipcMain.handle("safeStorage:setDevice", async (event, keys) => {
    try {
      if (electron.safeStorage.isEncryptionAvailable()) {
        const encryptedDevice = electron.safeStorage.encryptString(keys);
        await fsWriteFile(devicePath, encryptedDevice);
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  });

  ipcMain.handle("safeStorage:getDevice", async (event) => {
    try {
      const encryptedDevice = await fsReadFile(devicePath);
      if (!encryptedDevice) throw new Error("No Device");
      return electron.safeStorage.decryptString(encryptedDevice);
    } catch (err) {
      return undefined;
    }
  });

  ipcMain.handle("safeStorage:deleteDevice", async (event) => {
    try {
      await fsUnlink(devicePath);
      return true;
    } catch (err) {
      return false;
    }
  });

  createWindow();
});

// quit when all windows are closed, except on macOS. There, it's common
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

app.on("continue-activity", (event, type, userInfo) => {
  console.log(`TTTTTT Continuing activity of type ${type}`, event, userInfo);
  const debugPath = path.join(userDataPath, "debug.txt");
  fs.writeFileSync(debugPath, JSON.stringify({ type, event, userInfo }));
});

// // handoff support for macOS
// app.on('continue-activity', function(e, type, userInfo, details) {
//   if (type === 'NSUserActivityTypeBrowsingWeb' && details.webpageURL) {
//     e.preventDefault()
//     sendIPCToWindow(windows.getCurrent(), 'addTab', {
//       url: details.webpageURL
//     })
//   }
// })
