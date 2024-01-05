// import { HashRouter, Routes, Route } from 'react-router-dom';
import { Router, Route } from 'electron-router-dom';
import React from 'react';
import Home from './Pages/Home/Home';
import Login from './Pages/Login/Login';
import WarnPage from './Pages/WarnPage/WarnPage';

export default function AppRoutes() {
  return (
    <Router
      main={
        <>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
        </>
      }
      warning={<Route path="/" element={<WarnPage />} />}
      // <Route path="/home" element={<Home />} />
      // <Route path="/warning" element={<WarnPage />} />
      // <Route path="/login" element={<Login />} />
    />
  );
}
