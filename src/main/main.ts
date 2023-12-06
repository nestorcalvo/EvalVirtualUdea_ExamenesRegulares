/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain, ipcRenderer } from 'electron';
// import { autoUpdater } from 'electron-updater';
// import log from 'electron-log';
import { EventEmitter } from 'node:events';
import SOFTWARE from '../utils/listSoftwares';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';

const warningFound = new EventEmitter();

const psList = require('ps-list');

// class AppUpdater {
//   constructor() {
//     log.transports.file.level = 'info';
//     autoUpdater.logger = log;
//     autoUpdater.checkForUpdatesAndNotify();
//   }
// }
interface ProcessType {
  pid: number;
  name: string;
  cmd: string;
  ppid: number;
  uid: number;
  cpu: number;
  memory: number;
}
let mainWindow: BrowserWindow | null = null;
let warnWindow: BrowserWindow | null = null;
let warningWindowOpen: boolean = false;
ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});
ipcMain.on('open_window', async (event) => {
  const msgTemplate = (windowState: string) => `Window state: ${windowState}`;
  // console.log(msgTemplate(arg));
  if (mainWindow) {
    event.reply('open_window', msgTemplate('open'));
  } else {
    event.reply('open_window', msgTemplate('close'));
  }
});
ipcMain.on('warnWindowStatus', async (_event, arg) => {
  console.log(arg);
  if (arg) {
    console.log('Mensaje recibido');
    warningWindowOpen = true;
  } else {
    warningWindowOpen = false;
  }
});
if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

// if (isDebug) {
//   require('electron-debug')();
// }
const checkSoftware = async () => {
  let procesoFound = {};
  try {
    const currentProcesses: Array<ProcessType> = await psList();
    const softwareLower = SOFTWARE.map((e) => e.toLowerCase());
    procesoFound = currentProcesses.filter((processObject) => {
      if (softwareLower.includes(processObject.name.toLowerCase())) {
        return processObject;
      }
      return false;
    });

    warningFound.emit('software', procesoFound);
    // console.log(procesoFound);
  } catch (error) {
    console.error('Error getting processes:', error);
    return { err: error };
  }
  return procesoFound;
};
const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};
const createWarnWindow = async (parent: BrowserWindow, show: boolean) => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };
  warnWindow = new BrowserWindow({ parent, show });
  console.log(resolveHtmlPath('index.html'));
  console.log(resolveHtmlPath('home'));
  warnWindow.loadURL(resolveHtmlPath('home'));
  warnWindow.once('closed', () => {
    warnWindow = null;
  });
};
const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.webContents.on('did-frame-finish-load', () => {
    if (isDebug) {
      mainWindow!.webContents.openDevTools();
      mainWindow!.webContents.on('devtools-opened', () => {
        mainWindow!.focus();
      });
    }
    checkSoftware();
  });
  mainWindow.loadURL(resolveHtmlPath('index.html'));
  // createWarnWindow(mainWindow, true);
  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  // new AppUpdater();
};

warningFound.on('software', (args: Array<ProcessType>) => {
  let arrayFound = args.map((e) => e.name);
  arrayFound = [...new Set(arrayFound)];
  console.log('Something was found', arrayFound);
  if (!warningWindowOpen) {
    console.log('Apertura');
    // createWarnWindow(mainWindow!, true);

    // mainWindow!.webContents.send('software', arrayFound);
  }
});

/**
 * Add event listeners...
 */
const intervalId = setInterval(checkSoftware, 5000);
app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
app.on('before-quit', () => {
  clearInterval(intervalId);
});
app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
