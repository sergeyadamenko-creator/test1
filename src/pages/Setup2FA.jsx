import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Setup2FA = () => {
  const [step, setStep] = useState(1); // 1: выбор метода, 2: настройка, 3: подтверждение
  const [method, setMethod] = useState('totp'); // totp или sms
  const [secretKey, setSecretKey] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Генерация QR кода и секретного ключа через API
  const generateQRCode = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await axios.post('http://localhost:3001/api/setup-mfa', {
        method: method,
        phoneNumber: '' // будет добавлено позже если метод SMS
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setSecretKey(response.data.secretKey);
        setQrCode(response.data.qrCodeUrl);
      } else {
        setMessage(response.data.message || 'Failed to generate QR code');
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to generate QR code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMethodSelect = (selectedMethod) => {
    setMethod(selectedMethod);
    setStep(2);
    generateQRCode();
  };

  const handleVerifyCode = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      // Здесь будет API вызов для проверки кода
      // await verify2FACode(verificationCode, method);
      
      // Симуляция успешной проверки
      setTimeout(() => {
        setIsLoading(false);
        setStep(3);
        
        // Генерация резервных кодов
        const codes = Array.from({ length: 10 }, () => 
          Array.from({ length: 8 }, () => Math.floor(Math.random() * 10)).join('')
        );
        setBackupCodes(codes);
      }, 1000);
    } catch (error) {
      setIsLoading(false);
      setMessage('Invalid verification code. Please try again.');
    }
  };

  const handleFinishSetup = () => {
    setMessage('2FA setup completed successfully!');
  };

  const handleDownloadBackupCodes = () => {
    const codesText = backupCodes.join('\n');
    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="setup-2fa page">
      <div className="container">
        <h2>Setup Two-Factor Authentication</h2>
        
        {step === 1 && (
          <div className="setup-step">
            <h3>Choose Authentication Method</h3>
            <div className="method-selection">
              <div 
                className={`method-option ${method === 'totp' ? 'selected' : ''}`}
                onClick={() => handleMethodSelect('totp')}
              >
                <div className="method-icon">📱</div>
                <h4>Authenticator App</h4>
                <p>Use Google Authenticator, Authy, or similar app</p>
              </div>
              
              <div 
                className={`method-option ${method === 'sms' ? 'selected' : ''}`}
                onClick={() => handleMethodSelect('sms')}
              >
                <div className="method-icon">💬</div>
                <h4>SMS</h4>
                <p>Receive codes via text message</p>
              </div>
            </div>
          </div>
        )}
        
        {step === 2 && (
          <div className="setup-step">
            <h3>Configure {method === 'totp' ? 'Authenticator App' : 'SMS'}</h3>
            
            {method === 'totp' && (
              <div className="totp-setup">
                <p>Scan the QR code below with your authenticator app:</p>
                
                <div className="qr-container">
                  {qrCode ? (
                    <img src={qrCode} alt="QR Code for authenticator app" />
                  ) : isLoading ? (
                    <div className="qr-placeholder">Generating QR Code...</div>
                  ) : (
                    <div className="qr-placeholder">QR Code Loading...</div>
                  )}
                </div>
                
                <p>Or enter the secret key manually:</p>
                <div className="secret-key-display">
                  <code>{secretKey}</code>
                  <button 
                    className="copy-btn" 
                    onClick={() => navigator.clipboard.writeText(secretKey)}
                  >
                    Copy
                  </button>
                </div>
                
                <div className="form-group">
                  <label htmlFor="verificationCode">Enter 6-digit code from app:</label>
                  <input
                    type="text"
                    id="verificationCode"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    maxLength="6"
                    placeholder="000000"
                    required
                  />
                </div>
                
                {message && (
                  <div className="message error">{message}</div>
                )}
                
                <button 
                  onClick={handleVerifyCode} 
                  disabled={isLoading || verificationCode.length !== 6}
                  className="btn-primary"
                >
                  {isLoading ? 'Verifying...' : 'Verify Code'}
                </button>
              </div>
            )}
            
            {method === 'sms' && (
              <div className="sms-setup">
                <p>We will send a verification code to your phone number.</p>
                
                <div className="form-group">
                  <label htmlFor="phoneNumber">Phone Number:</label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    placeholder="+1 (555) 123-4567"
                    required
                  />
                </div>
                
                <button 
                  onClick={() => setStep(3)} 
                  className="btn-primary"
                >
                  Send Verification Code
                </button>
              </div>
            )}
            
            <button 
              onClick={() => setStep(1)} 
              className="btn-secondary back-btn"
            >
              Back
            </button>
          </div>
        )}
        
        {step === 3 && (
          <div className="setup-step">
            <h3>2FA Setup Complete</h3>
            
            <div className="success-message">
              <div className="checkmark">✓</div>
              <p>Your two-factor authentication is now enabled.</p>
            </div>
            
            <div className="backup-codes-section">
              <h4>Backup Codes</h4>
              <p>Store these backup codes in a secure location. You can use them if you lose access to your primary authentication method.</p>
              
              <div className="backup-codes-display">
                {backupCodes.map((code, index) => (
                  <div key={index} className="backup-code">{code}</div>
                ))}
              </div>
              
              <button 
                onClick={handleDownloadBackupCodes}
                className="btn-primary"
              >
                Download Backup Codes
              </button>
            </div>
            
            <button 
              onClick={handleFinishSetup} 
              className="btn-primary"
            >
              Finish Setup
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Setup2FA;