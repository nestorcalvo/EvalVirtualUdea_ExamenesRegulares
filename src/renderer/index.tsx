import { createRoot } from 'react-dom/client';
import * as Sentry from '@sentry/electron/renderer';
import App from './App';

(window as any).$ = require('jquery');
(window as any).jQuery = require('jquery');

const container = document.getElementById('root') as HTMLElement;
Sentry.init({
  dsn: 'https://abc0487a3bfb9f750007f4b5a5820614@o4506662181601280.ingest.sentry.io/4506662193856512',
});
const root = createRoot(container);
root.render(<App />);

// // calling IPC exposed from preload script
// window.electron.ipcRenderer.once('ipc-example', (arg) => {
//   // eslint-disable-next-line no-console
//   console.log('Respuesta del main', arg);
// });
// window.electron.ipcRenderer.once('open_window', (arg) => {
//   // eslint-disable-next-line no-console
//   console.log(arg);
// });
// window.electron.ipcRenderer.sendMessage('ipc-example', ['ping']);
// window.electron.ipcRenderer.sendMessage('open_window');
