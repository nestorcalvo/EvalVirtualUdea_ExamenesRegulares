import { createRoot } from 'react-dom/client';
import App from './App';

(window as any).$ = require('jquery');
(window as any).jQuery = require('jquery');

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(<App />);

// calling IPC exposed from preload script
window.electron.ipcRenderer.once('ipc-example', (arg) => {
  // eslint-disable-next-line no-console
  console.log('Respuesta del main', arg);
});
window.electron.ipcRenderer.once('open_window', (arg) => {
  // eslint-disable-next-line no-console
  console.log(arg);
});
window.electron.ipcRenderer.sendMessage('ipc-example', ['ping']);
window.electron.ipcRenderer.sendMessage('open_window');
