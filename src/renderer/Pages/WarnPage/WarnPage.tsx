import React, { useState, useEffect, useRef } from 'react';

function WarnPage() {
  const [warning, setWarning] = useState('');
  const [warningType, setWarningType] = useState('');
  const [timer, setTimer] = useState(15);
  const intervalRef: any = useRef();

  useEffect(() => {
    window.electron.ipcRenderer.once('open_window', (args) => {
      if (Array.isArray(args)) {
        setWarningType('software');
        const warn = args!.join(', ');
        setWarning(warn);
      }
    });
  }, []);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimer((t) => t - 1);
      if (timer === 10) {
        window.electron.ipcRenderer.sendMessage('screenshot');
      } else if (timer === 5) {
        window.electron.ipcRenderer.sendMessage('close_software');
      }
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [timer]);

  useEffect(() => {
    if (timer <= 0) {
      clearInterval(intervalRef.current);
      window.electron.ipcRenderer.sendMessage('countdown_over');
    }
  }, [timer]);

  return (
    <div>
      <h1>ALERTA</h1>
      {warningType === 'software' && <h1>{warning}</h1>}
      <h1>{timer}</h1>
    </div>
  );
}

export default WarnPage;
