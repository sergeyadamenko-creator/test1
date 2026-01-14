import React from 'react';
import { Link } from 'react-router-dom';

const Header = ({ isAuthenticated, onLogout }) => {
  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">
          <h1>Self-Service Portal</h1>
        </Link>
        
        {isAuthenticated ? (
          <nav className="nav">
            <ul className="nav-list">
              <li><Link to="/">Dashboard</Link></li>
              <li><Link to="/change-password">Change Password</Link></li>
              <li><Link to="/unlock-account">Unlock Account</Link></li>
              <li><Link to="/setup-mfa">Setup 2FA</Link></li>
              <li><button onClick={onLogout} className="logout-btn">Logout</button></li>
            </ul>
          </nav>
        ) : (
          <nav className="nav">
            <ul className="nav-list">
              <li><Link to="/login">Login</Link></li>
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;