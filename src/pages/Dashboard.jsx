import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = ({ user }) => {
  return (
    <div className="dashboard page">
      <div className="container">
        <h2>Dashboard</h2>
        <p>Welcome, {user ? user.preferred_username || user.name : 'User'}!</p>
        
        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="actions-grid">
            <Link to="/change-password" className="action-card">
              <h4>Change Password</h4>
              <p>Update your account password</p>
            </Link>
            
            <Link to="/unlock-account" className="action-card">
              <h4>Unlock Account</h4>
              <p>Unlock your locked account</p>
            </Link>
            
            <Link to="/setup-mfa" className="action-card">
              <h4>Setup 2FA</h4>
              <p>Configure two-factor authentication</p>
            </Link>
          </div>
        </div>
        
        <div className="account-info">
          <h3>Account Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Username:</label>
              <span>{user?.preferred_username || 'N/A'}</span>
            </div>
            <div className="info-item">
              <label>Email:</label>
              <span>{user?.email || 'N/A'}</span>
            </div>
            <div className="info-item">
              <label>Status:</label>
              <span className="status active">Active</span>
            </div>
            <div className="info-item">
              <label>2FA Status:</label>
              <span className="status enabled">Enabled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;