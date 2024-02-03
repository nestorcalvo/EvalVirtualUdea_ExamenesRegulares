/* eslint-disable no-unused-expressions */
/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import os from 'os';
import path from 'path';
import {
  app,
  BrowserWindow,
  shell,
  ipcMain,
  screen,
  net,
  desktopCapturer,
} from 'electron';
// import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import { createFileRoute, createURLRoute } from 'electron-router-dom';
import { EventEmitter } from 'node:events';
import { autoUpdater } from 'electron-updater';
// import { BASE_URL_POSTMAN } from 'utils/constants';
import SOFTWARE from '../utils/listSoftwares';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';

const warningFound = new EventEmitter();

const psList = require('ps-list');
const fkill = require('fkill');

// export default class AppUpdater {
//   constructor() {
//     console.log('App Updater created');
//     log.transports.file.level = 'debug';
//     autoUpdater.logger = log;
//     autoUpdater.checkForUpdatesAndNotify();
//   }
// }
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
console.log = log.log;
const BASE_URL_POSTMAN =
  'https://5a667436-590b-4383-a2bb-42a790e2e7df.mock.pstmn.io';
// const BASE_URL_DEV = 'to be added';
// const BASE_URL = 'to be added';
// const TOKEN = '125413';
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
let arrayFound: Array<string> | null | undefined;
let numberScreenFound: number | null | undefined;
let pidFound: Array<number> | null | undefined;
let userToken: string | null = null;
let intervalIdScreen: ReturnType<typeof setInterval>;
let intervalIdSoftware: ReturnType<typeof setInterval>;

const getDeviceInfo = () => {
  const deviceInfo = {
    arch: os.arch(),
    processor: os.cpus(),
    ram: os.totalmem(),
    name: os.hostname(),
    networkInterfaces: os.networkInterfaces(),
    platform: os.platform(),
    kernel: os.version(),
    freemem: os.freemem(),
  };
  return deviceInfo;
};
const sendInformation = async (data: any, saveInfoLocalLog = false) => {
  console.log('Entry of function to send information');
  const protoclName = BASE_URL_POSTMAN.split('//')[0];
  const host = BASE_URL_POSTMAN.split('//')[1];
  const request = net.request({
    method: 'POST',
    protocol: protoclName,
    hostname: host,
    path: '/warning',
  });
  // request.setHeader(
  //   'Token-Security',
  //   '13bqmrE5RBwj1Pj2FYxAshlQPyljjf8NZl4yZ5Fvm1wMJ0XnmcwCAgTqY6x0xuBC5K41n'
  // );
  request.setHeader('Content-Type', 'application/json');
  request.write(JSON.stringify(data), 'utf-8');
  request.on('response', (response) => {
    if (saveInfoLocalLog) {
      console.log('Response status code: ', response.statusCode);
      console.log('Response status message: ', response.statusMessage);
    }
    if (response.statusCode === 401 || response.statusCode === 500) {
      console.error(
        `Error when sending the request > Response code ${response.statusCode}`
      );
      return response.statusCode;
    }
    response.on('data', (chunk) => {
      if (saveInfoLocalLog) {
        console.log(`BODY: ${chunk}`);
      }
    });
    return response.statusCode;
  });
  request.end();
  return request;
};
ipcMain.on('countdown_over', async () => {
  console.log('WarnWindow message > Countdown to 0');
  warnWindow?.close();
  console.log('Main process message > Warning window closed');
});
ipcMain.on('start_exam', async (_event, url) => {
  console.log('Message from HomePage > Start exam');
  mainWindow?.loadURL(url);
  const body = {
    identification: userToken,
    type_log: 1,
    remoteControl: false,
    externalDevices: false,
    externalScreen: false,
    description: 'Examen iniciado',
    information: '',
  };
  sendInformation(body, true);
});
ipcMain.on('screenshot', async () => {
  console.log('WarnWindow message > Screenshoot time');
  if (userToken) {
    console.log('WarnWindow message > User found screenshoot taken');
    desktopCapturer
      .getSources({
        types: ['screen'],
        thumbnailSize: {
          width: 720,
          height: 480,
        },
      })
      .then((sources) => {
        for (let i = 0; i < sources.length; i += 1) {
          if (i === 0) {
            // The image to display the screenshot
            // console.log(sources);
            const file = sources[i].thumbnail.toDataURL();

            console.log('Main process message > Screenshot taken');
            const body = {
              identification: userToken,
              type_log: 4,
              remoteControl: arrayFound,
              externalDevices: false,
              externalScreen: false,
              description: 'Screenshot',
              information: file.split(',')[1],
            };

            sendInformation(body, true);
          }
        }
      })
      .catch((error) => {
        console.error('Main process message > Error when taking screenshot');
        console.error(error);
      });
  } else {
    console.log('WarnWindow message > User not found');
  }
});
ipcMain.on('close_software', async () => {
  console.log('WarnWindow message > Close software');
  await fkill(pidFound, {
    force: true,
    ignoreCase: true,
    silent: true,
  });
  console.log('Main process message > Software closed');
});
ipcMain.on('userLogin', async (_event, arg) => {
  userToken = arg;
  const deviceInfo = getDeviceInfo();
  const body = {
    identification: userToken,
    type_log: 0,
    remoteControl: false,
    externalDevices: false,
    externalScreen: false,
    description: 'Registro informacion PC',
    information: Buffer.from(JSON.stringify(deviceInfo)).toString('base64'),
  };
  const request = await sendInformation(body, true);
  if (Number(request) === 401) {
    console.warn(
      'Problemas al envio de información inicial, checkear request o servidor'
    );
    console.log(request);
  }
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
if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

// if (isDebug) {
//   require('electron-debug')();
// }
// const checkScreen = async () => {
//   const screenFound: ReturnType<typeof screen.getAllDisplays> =
//     screen.getAllDisplays();
//   // If there is more than one screen

//   if (screenFound.length > 1) {
//     numberScreenFound = screenFound.length;
//     warningFound.emit('multiple-screen', numberScreenFound);
//   }
// };
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
  } catch (error) {
    console.error('Error getting processes:', error);
    return { err: error };
  }
  return procesoFound;
};
// const installExtensions = async () => {
//   const installer = require('electron-devtools-installer');
//   const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
//   const extensions = ['REACT_DEVELOPER_TOOLS'];

//   return installer
//     .default(
//       extensions.map((name) => installer[name]),
//       forceDownload
//     )
//     .catch(console.log);
// };
const createWarnWindow = async (
  parent: BrowserWindow,
  show: boolean,
  warning: number | Array<string> | boolean
) => {
  // if (isDebug) {
  //   await installExtensions();
  // }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };
  warnWindow = new BrowserWindow({
    parent,
    show,
    icon: getAssetPath('icon.png'),
    resizable: isDebug,
    minimizable: isDebug,
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });
  warnWindow.setContentProtection(!isDebug);
  warnWindow.setAlwaysOnTop(isDebug, 'pop-up-menu');
  const route = 'warning';
  const devServerURL = createURLRoute(resolveHtmlPath('index.html'), route);

  const fileRoute = createFileRoute(
    path.join(__dirname, '../renderer/index.html'),
    route
  );
  process.env.NODE_ENV === 'development'
    ? warnWindow.loadURL(devServerURL)
    : warnWindow.loadFile(...fileRoute);
  warnWindow.once('ready-to-show', () => {
    warnWindow?.webContents.send(
      'open_window',
      warningWindowOpen ? warning : false
    );
  });
  isDebug
    ? warnWindow.setAlwaysOnTop(true, 'pop-up-menu')
    : warnWindow.setAlwaysOnTop(false, 'pop-up-menu');

  warnWindow.once('closed', () => {
    warnWindow = null;
    warningWindowOpen = false;
  });
  return warnWindow;
};
const createWindow = async () => {
  // if (isDebug) {
  //   await installExtensions();
  // }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: isDebug ? 1024 : screen.getPrimaryDisplay().workAreaSize.width,
    height: isDebug ? 728 : screen.getPrimaryDisplay().workAreaSize.height,
    resizable: isDebug,
    minimizable: isDebug,

    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });
  mainWindow.setContentProtection(!isDebug);
  mainWindow.setAlwaysOnTop(!isDebug, 'screen-saver');
  mainWindow.setFullScreen(!isDebug);
  mainWindow.webContents.on('did-frame-finish-load', () => {
    if (isDebug) {
      mainWindow!.webContents.openDevTools();
      mainWindow!.webContents.on('devtools-opened', () => {
        mainWindow!.focus();
      });
    }
    intervalIdSoftware = setInterval(checkSoftware, 5000);
    // intervalIdScreen = setInterval(checkScreen, 5000);
  });
  const route = 'main';
  const devServerURL = createURLRoute(resolveHtmlPath('index.html'), route);

  const fileRoute = createFileRoute(
    path.join(__dirname, '../renderer/index.html'),
    route
  );
  process.env.NODE_ENV === 'development'
    ? mainWindow.loadURL(devServerURL)
    : mainWindow.loadFile(...fileRoute);
  // createWarnWindow(mainWindow, false);

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      console.error('"mainWindow" is not defined');
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow?.webContents.send('check_version', app.getVersion());
    }
  });

  mainWindow.on('closed', () => {
    if (userToken) {
      console.log('Request sent to inform that app is going to be closed');
      const body = {
        identification: userToken,
        type_log: 0,
        remoteControl: false,
        externalDevices: false,
        externalScreen: false,
        description: 'Cierre de aplicación',
        information: '',
      };
      sendInformation(body, true)
        .then(() => {
          console.log('Request sent');
        })
        .catch(() => {
          console.error('Error when sending information of app closed');
        });
    }
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
autoUpdater.on('checking-for-update', () => {
  console.log('Checking for update...');
});
autoUpdater.on('update-available', (info) => {
  console.log('Update available.', info);
});
autoUpdater.on('update-not-available', (info) => {
  console.log('Update not available.', info);
});
autoUpdater.on('error', (err) => {
  console.log(`Error in auto-updater. ${err}`);
});
autoUpdater.on('download-progress', (progressObj) => {
  let logMessage = `Download speed: ${progressObj.bytesPerSecond}`;
  logMessage = `${logMessage} - Downloaded ${progressObj.percent}%`;
  logMessage = `${logMessage} (${progressObj.transferred}/${progressObj.total})`;
  console.log(logMessage);
});
autoUpdater.on('update-downloaded', (info) => {
  console.log('Update downloaded', info);
});
function sendStatusToWindow(content: any) {
  mainWindow?.on('ready-to-show', () => {
    mainWindow?.webContents.send('show_notification', content);
  });
}

warningFound.on('software', async (args: Array<ProcessType>) => {
  arrayFound = args.map((e) => e.name);
  pidFound = args.map((e) => e.pid);
  arrayFound = [...new Set(arrayFound)];
  // Check if there is two alerts of software
  if (!warningWindowOpen && arrayFound?.length) {
    console.log('Warning found > software > ', arrayFound);
    console.log('Warnwindow > open');
    createWarnWindow(mainWindow!, true, arrayFound);
    if (userToken) {
      console.log('Main process > Sent warning information for software');
      let descriptionPost = 'El usuario tiene: ';
      if (arrayFound) {
        descriptionPost += `[Softwares no permitidos: ${arrayFound}]`;
      }

      const body = {
        identification: userToken,
        type_log: 2,
        remoteControl: arrayFound,
        externalDevices: false,
        externalScreen: false,
        description: descriptionPost,
        information: Buffer.from(
          JSON.stringify({
            arrayFound,
          })
        ).toString('base64'),
      };
      const request = await sendInformation(body, true);
      // Unauthorized
      if (Number(request) === 401) {
        console.warn(
          'Problemas al envio de información de warning, checkear request o servidor'
        );
        console.log(request);
      }
    }
    // Set warningWindowOpen to true so it doesnt open a window
    warningWindowOpen = true;
  }
});

warningFound.on('multiple-screen', async (args: number) => {
  if (!warningWindowOpen) {
    console.log('Warning found > multiple screens > ', args);
    console.log('Warnwindow > open');
    createWarnWindow(mainWindow!, true, args);
    if (userToken) {
      console.log(
        'Main process > Sent warning information for multiple screen'
      );
      let descriptionPost = 'El usuario tiene: ';
      descriptionPost += `${args} pantallas`;
      const body = {
        identification: userToken,
        type_log: 2,
        remoteControl: false,
        externalDevices: false,
        externalScreen: true,
        description: descriptionPost,
        information: `${args} pantallas`,
      };
      const request = await sendInformation(body, true);
      // Unauthorized
      if (Number(request) === 401) {
        console.warn(
          'Problemas al envio de información de warning, checkear request o servidor'
        );
        console.log(request);
      }
    }
    // Set warningWindowOpen to true so it doesnt open a window
    warningWindowOpen = true;
  }
});
/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
app.on('before-quit', () => {
  clearInterval(intervalIdScreen);
  clearInterval(intervalIdSoftware);
});
app
  .whenReady()
  .then(() => {
    createWindow();
    // autoUpdater.on('update-available', (info) => {
    //   console.log(info);
    // });
    // autoUpdater.checkForUpdates();
    autoUpdater.checkForUpdates();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
