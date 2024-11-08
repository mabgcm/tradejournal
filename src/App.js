// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './Components/Register';
import Home from './Components/Home';
import Layout from './Components/Layout';
import TradeLogs from './Components/TradeLogs';

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} title="Home" />
          <Route path="/register" element={<Register />} title="Register" />
          <Route path="/logs" element={<TradeLogs />} title="Trade Logs" />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
