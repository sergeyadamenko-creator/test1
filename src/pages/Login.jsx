import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
      // Здесь будет реальный API вызов для аутентификации
      // const response = await authenticateUser(username, password);
      
      // Симуляция успешной аутентификации
      setTimeout(() => {
        setIsLoading(false);
        
        // Создаем mock данные пользователя
        const mockUser = {
          preferred_username: username,
          email: `${username}@example.com`,
          name: username,
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
        };
        
        onLogin(mockUser);
        navigate('/');
      }, 1000);
    } catch (error) {
      setIsLoading(false);
      setMessage('Login failed: ' + error.message);
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