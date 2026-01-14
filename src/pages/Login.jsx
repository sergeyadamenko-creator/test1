import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await axios.post('http://localhost:3001/api/login', {
        username,
        password
      });

      // Сохраняем токен в localStorage
      localStorage.setItem('authToken', response.data.token);

      // Вызываем колбэк для обновления состояния аутентификации
      onLogin(response.data.user);

      // Переходим на главную страницу
      navigate('/');
    } catch (error) {
      setIsLoading(false);
      if (error.response) {
        setMessage(`Login failed: ${error.response.data.message || 'Invalid credentials'}`);
      } else {
        setMessage('Login failed: Network error');
      }
    }
  };

  return (
    <div className="login page">
      <div className="container">
        <div className="login-box">
          <h2>Login to Self-Service Portal</h2>
          
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            
            {message && (
              <div className="message error">{message}</div>
            )}
            
            <button type="submit" disabled={isLoading} className="btn-primary">
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          
          <div className="login-help">
            <a href="/forgot-password">Forgot Password?</a>
            <a href="/help">Need Help?</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;