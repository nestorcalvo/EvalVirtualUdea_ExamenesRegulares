import React from 'react';
import { useLocation } from 'react-router-dom';
import icon from '../../../../assets/icon.png';

function Home() {
  const { state } = useLocation();
  const token = state?.token;
  // SEND PC INFORATION EVENT
  // START ANALYZING SOFTWARE EVENT
  window.electron.ipcRenderer.once('open_window', (args) => {
    console.log(args);
  });
  return (
    <div>
      <div className="Hello">
        <img width="200" alt="icon" src={icon} />
      </div>
      <h1>Eval Virtual Udea</h1>
    </div>
  );
}
export default Home;
