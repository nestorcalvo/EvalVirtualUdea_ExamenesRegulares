import React, { useState } from 'react';

function WarnPage() {
  const [warningType, setWarningType] = useState('');
  window.electron.ipcRenderer.on('open_window', (...args) => {
    const warn: String = args[0];
    setWarningType(warn);
  });
  return (
    <div>
      <h1>WarnPage</h1>
    </div>
  );
}

export default WarnPage;
