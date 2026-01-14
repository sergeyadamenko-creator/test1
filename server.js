const express = require('express');
const Keycloak = require('keycloak-connect');
const session = require('express-session');
const path = require('path');
const { getConfig } = require('./keycloak-config');
const { MultiRealmKeycloakManager } = require('./keycloak-admin-example');

const app = express();
const port = process.env.PORT || 3001;

// Настройка сессий
app.use(session({
  secret: 'your-session-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, httpOnly: true }
}));

// Получение конфигурации Keycloak
const config = getConfig();

// Инициализация Keycloak
const keycloak = new Keycloak({
  store: 'memory',
  realm: config.realm,
  'auth-server-url': config.baseUrl,
  'ssl-required': 'external',
  resource: config.clientId,
  'public-client': true,
  'confidential-port': 0
});

// Инициализация менеджера для работы с несколькими realm
const multiRealmManager = new MultiRealmKeycloakManager();

// Добавляем текущий realm в менеджер
multiRealmManager.addRealm(config.realm, {
  baseUrl: config.baseUrl,
  realm: config.realm,
  clientId: config.clientId,
  clientSecret: config.credentials.secret
});

// Middleware для Keycloak
app.use(keycloak.middleware());

// Маршруты API для самообслуживания
app.get('/api/user/profile', keycloak.protect(), (req, res) => {
  res.json({
    username: req.kauth.grant.access_token.content.preferred_username,
    email: req.kauth.grant.access_token.content.email,
    firstName: req.kauth.grant.access_token.content.given_name,
    lastName: req.kauth.grant.access_token.content.family_name
  });
});

// API для смены пароля
app.post('/api/change-password', keycloak.protect(), express.json(), async (req, res) => {
  try {
    // Текущая реализация позволяет только изменить пароль текущего пользователя
    // В реальном приложении может потребоваться больше прав для смены чужого пароля
    const username = req.kauth.grant.access_token.content.preferred_username;
    const { currentPassword, newPassword } = req.body;
    
    // В реальном приложении здесь будет проверка currentPassword и смена на newPassword
    // через Keycloak Admin API
    
    // Для демонстрации просто возвращаем успех
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ success: false, message: 'Error changing password' });
  }
});

// API для разблокировки аккаунта
app.post('/api/unlock-account', keycloak.protect(), express.json(), async (req, res) => {
  try {
    const { username } = req.body;
    
    // В реальном приложении здесь будет вызов Keycloak Admin API
    // для разблокировки аккаунта пользователя
    // const result = await multiRealmManager.executeOperation(`${username}@example.com`, 'unlockUserAccount');
    
    // Для демонстрации просто возвращаем успех
    res.json({ success: true, message: `Account ${username} has been unlocked` });
  } catch (error) {
    console.error('Error unlocking account:', error);
    res.status(500).json({ success: false, message: 'Error unlocking account' });
  }
});

// API для настройки MFA
app.post('/api/setup-mfa', keycloak.protect(), express.json(), (req, res) => {
  // Реализация настройки MFA через Keycloak
  const { method, phoneNumber } = req.body;
  
  // В реальном приложении здесь будет интеграция с Keycloak
  // для настройки двухфакторной аутентификации
  
  res.json({ 
    success: true, 
    message: 'MFA setup initiated',
    secretKey: 'ABCDEF1234567890', // временный ключ для демонстрации
    qrCodeUrl: `https://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=${encodeURIComponent(`otpauth://totp/Self-Service%20Portal:${req.kauth.grant.access_token.content.preferred_username}?secret=ABCDEF1234567890&issuer=Self-Service%20Portal`)}`
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