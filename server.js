const express = require('express');
const session = require('express-session');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Настройка сессий
app.use(session({
  secret: 'your-session-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, httpOnly: true }
}));

// Secret для JWT
const JWT_SECRET = 'your-jwt-secret';

// Простая "база данных" пользователей (в реальном приложении использовалась бы настоящая БД)
const users = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    password: bcrypt.hashSync('admin123', 10), // хэшированный пароль
    firstName: 'Admin',
    lastName: 'User',
    locked: false
  },
  {
    id: 2,
    username: 'user',
    email: 'user@example.com',
    password: bcrypt.hashSync('user123', 10), // хэшированный пароль
    firstName: 'Regular',
    lastName: 'User',
    locked: false
  }
];

// Middleware для проверки аутентификации
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Маршрут для аутентификации
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Найти пользователя
    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Проверить пароль
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Проверить, заблокирован ли пользователь
    if (user.locked) {
      return res.status(401).json({ message: 'Account is locked' });
    }

    // Создать JWT токен
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Маршруты API для самообслуживания
app.get('/api/user/profile', authenticateToken, (req, res) => {
  res.json({
    username: req.user.username,
    email: req.user.email,
    firstName: req.user.firstName,
    lastName: req.user.lastName
  });
});

// API для смены пароля
app.post('/api/change-password', authenticateToken, express.json(), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Найти пользователя
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = users[userIndex];

    // Проверить текущий пароль
    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    // Хэшируем новый пароль
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    users[userIndex].password = hashedNewPassword;

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ success: false, message: 'Error changing password' });
  }
});

// API для разблокировки аккаунта
app.post('/api/unlock-account', authenticateToken, express.json(), async (req, res) => {
  try {
    const { username } = req.body;

    // Только администратор может разблокировать аккаунты
    if (req.user.username !== 'admin') {
      return res.status(403).json({ success: false, message: 'Permission denied' });
    }

    const userIndex = users.findIndex(u => u.username === username);
    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: `User ${username} not found` });
    }

    users[userIndex].locked = false;

    res.json({ success: true, message: `Account ${username} has been unlocked` });
  } catch (error) {
    console.error('Error unlocking account:', error);
    res.status(500).json({ success: false, message: 'Error unlocking account' });
  }
});

// API для настройки 2FA
app.post('/api/setup-mfa', authenticateToken, express.json(), (req, res) => {
  // Реализация настройки 2FA
  const { method, phoneNumber } = req.body;

  // В реальном приложении здесь будет интеграция с сервисом 2FA
  // для настройки двухфакторной аутентификации

  res.json({ 
    success: true, 
    message: '2FA setup initiated',
    secretKey: 'ABCDEF1234567890', // временный ключ для демонстрации
    qrCodeUrl: `https://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=${encodeURIComponent(`otpauth://totp/Self-Service%20Portal:${req.user.username}?secret=ABCDEF1234567890&issuer=Self-Service%20Portal`)}`
  });
});

// Сервинг статических файлов из build директории
app.use(express.static(path.join(__dirname, 'dist')));

// Все маршруты, кроме API, должны возвращать index.html для работы SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${port}`);
});