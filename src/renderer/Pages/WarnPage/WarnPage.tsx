import React, { useState, useEffect, useRef } from 'react';

function WarnPage() {
  const [warning, setWarning] = useState('');
  const [warningType, setWarningType] = useState('');
  const [timer, setTimer] = useState(10);
  useEffect(() => {
    window.electron.ipcRenderer.once('open_window', (args) => {
      if (Array.isArray(args)) {
        setWarningType('software');
        const warn = args!.join(', ');
        setWarning(warn);
      }
    });
  }, []);
  const intervalRef: any = useRef(); // Add a ref to store the interval id

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimer((t) => t - 1);
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  // Add a listener to `timeLeft`
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
