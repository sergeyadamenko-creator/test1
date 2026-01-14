import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import PasswordChange from './pages/PasswordChange';
import AccountUnlock from './pages/AccountUnlock';
import Setup2FA from './pages/Setup2FA';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import './assets/style.css';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Проверяем аутентификацию при загрузке приложения
  useEffect(() => {
    // Проверяем наличие токена в localStorage
    const token = localStorage.getItem('authToken');
    if (token) {
      // В реальном приложении нужно декодировать токен и проверить его валидность
      setIsAuthenticated(true);
      // Можно декодировать базовую информацию из токена
      try {
        const payload = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payload));
        setUser(decodedPayload);
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, []);

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('authToken');
  };

  return (
    <Router>
      <div className="app">
        <Header isAuthenticated={isAuthenticated} onLogout={handleLogout} />
        <main className="main-content">
          <Routes>
            <Route 
              path="/" 
              element={
                isAuthenticated ? 
                  <Dashboard user={user} /> : 
                  <Navigate to="/login" />
              } 
            />
            <Route 
              path="/login" 
              element={
                !isAuthenticated ? 
                  <Login onLogin={handleLogin} /> : 
                  <Navigate to="/" />
              } 
            />
            <Route 
              path="/change-password" 
              element={
                isAuthenticated ? 
                  <PasswordChange /> : 
                  <Navigate to="/login" />
              } 
            />
            <Route 
              path="/unlock-account" 
              element={
                isAuthenticated ? 
                  <AccountUnlock /> : 
                  <Navigate to="/login" />
              } 
            />
            <Route 
              path="/setup-mfa" 
              element={
                isAuthenticated ? 
                  <Setup2FA /> : 
                  <Navigate to="/login" />
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;