import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import React from 'react';
import Home from './Pages/Home/Home';
import Login from './Pages/Login/Login';
import WarnPage from './Pages/WarnPage/WarnPage';

export default function App() {
  return (
    <React.StrictMode>
      <BrowserRouter>
        <Routes>
          <Route path="/*" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/warning" element={<WarnPage />} />
        </Routes>
      </BrowserRouter>
    </React.StrictMode>
  );
}
