import React, { useState } from 'react';

function WarnPage() {
  const [warning, setWarning] = useState('');
  const [warningType, setWarningType] = useState('');
  window.electron.ipcRenderer.once('open_window', (args) => {
    if (Array.isArray(args)) {
      setWarningType('software');
      const warn = args!.join(', ');
      setWarning(warn);
    }
  });

  return (
    <div>
      <h1>ALERTA</h1>
      {warningType === 'software' && <h1>{warning}</h1>}
    </div>
  );
}

export default WarnPage;
