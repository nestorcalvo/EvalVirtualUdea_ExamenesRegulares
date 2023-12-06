import React from 'react';

function WarnPage() {
  window.electron.ipcRenderer.sendMessage('warnWindowStatus', true);
  return <div>WarnPage</div>;
}

export default WarnPage;
