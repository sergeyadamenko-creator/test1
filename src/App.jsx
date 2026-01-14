import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import PasswordChange from './pages/PasswordChange';
import AccountUnlock from './pages/AccountUnlock';
import MFASetup from './pages/MFASetup';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import './assets/style.css';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Проверяем аутентификацию при загрузке приложения
  useEffect(() => {
    // Здесь будет логика проверки сессии
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
      // Получаем информацию о пользователе
      try {
        const userData = JSON.parse(atob(token.split('.')[1]));
        setUser(userData);
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }
  }, []);

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    localStorage.setItem('authToken', userData.token);
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
                  <MFASetup /> : 
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