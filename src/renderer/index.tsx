import { createRoot } from 'react-dom/client';
import App from './App';

(window as any).$ = require('jquery');
(window as any).jQuery = require('jquery');

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(<App />);
