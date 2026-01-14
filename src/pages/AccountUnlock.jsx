import React, { useState } from 'react';
import axios from 'axios';

const AccountUnlock = () => {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('authToken');
      
      const response = await axios.post('http://localhost:3001/api/unlock-account', {
        username
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setIsLoading(false);
        setMessage(`Account "${username}" has been unlocked successfully!`);
        setUsername('');
      } else {
        setMessage(response.data.message || 'Failed to unlock account');
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
      if (error.response) {
        setMessage(error.response.data.message || 'Failed to unlock account');
      } else {
        setMessage('Network error occurred');
      }
    }
  };

  return (
    <div className="account-unlock page">
      <div className="container">
        <h2>Unlock Account</h2>
        <p className="page-description">
          Enter your username to unlock your account if it has been locked due to multiple failed login attempts.
        </p>
        
        <form onSubmit={handleSubmit} className="unlock-form">
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
          
          {message && (
            <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}
          
          <button type="submit" disabled={isLoading} className="btn-primary">
            {isLoading ? 'Unlocking...' : 'Unlock Account'}
          </button>
        </form>
        
        <div className="help-section">
          <h3>Need help?</h3>
          <p>If you're having trouble unlocking your account, please contact your system administrator.</p>
        </div>
      </div>
    </div>
  );
};

export default AccountUnlock;