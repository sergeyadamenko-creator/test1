# MFA Self-Service Portal

Клон сайта https://mfa.b1.ru/ - это портал самообслуживания, где пользователи могут изменить пароль, разблокировать свою учетную запись и настроить двухфакторную аутентификацию (MFA).

## Особенности

- Изменение пароля
- Разблокировка аккаунта
- Настройка MFA (TOTP и SMS)
- Совместимость с Keycloak
- Поддержка нескольких realm
- Адаптивный дизайн

## Архитектура

Проект состоит из следующих компонентов:

1. **Frontend**: SPA-приложение на React с использованием React Router
2. **Backend**: API-сервер на Node.js/Express с интеграцией Keycloak
3. **Identity Provider**: Keycloak для аутентификации и авторизации

Подробнее о архитектуре и работе с несколькими realm смотрите в файле [ARCHITECTURE.md](./ARCHITECTURE.md).

## Установка

1. Установите зависимости:
   ```bash
   npm install
   ```

2. Настройте переменные окружения:
   ```bash
   cp .env.example .env
   # Отредактируйте .env файл под свои нужды
   ```

3. Запустите приложение в режиме разработки:
   ```bash
   npm run dev
   ```

## Настройка Keycloak

1. Создайте realm в Keycloak (например, `self-service-realm`)
2. Создайте клиент (client) для этого приложения
3. Обновите конфигурацию в `keycloak-config.js`
4. Убедитесь, что у вас есть права на вызов Admin API для выполнения операций управления

## Использование

После запуска приложение будет доступно по адресу http://localhost:3000

Для тестирования функционала:
1. Перейдите на страницу входа
2. Войдите с тестовыми учетными данными
3. Используйте навигацию для доступа к различным функциям

## Настройка MFA через Keycloak

Архитектурно, для каждого приложения с отдельным realm, MFA настраивается следующим образом:

1. **Единый Self-Service Portal** интегрируется с каждым realm Keycloak
2. Для каждого realm настраиваются доверенные клиенты (trusted clients)
3. Используется единый сервисный аккаунт для доступа к Admin API
4. При регистрации или изменении настроек MFA, Self-Service Portal взаимодействует с соответствующим realm

### Поддержка нескольких Realm

В файле `keycloak-config.js` можно настроить конфигурации для разных окружений и realm:

```javascript
const keycloakConfig = {
  development: {
    clientId: 'self-service-portal-dev',
    realm: 'self-service-realm',
    baseUrl: 'http://localhost:8080',
    authUrl: '/realms/self-service-realm/protocol/openid-connect',
    adminUrl: '/admin/realms/self-service-realm',
    credentials: {
      secret: 'your-client-secret'
    }
  },
  production: {
    clientId: 'self-service-portal-prod',
    realm: 'production-realm',
    baseUrl: process.env.KEYCLOAK_BASE_URL || 'https://sso.yourcompany.com',
    authUrl: '/realms/production-realm/protocol/openid-connect',
    adminUrl: '/admin/realms/production-realm',
    credentials: {
      secret: process.env.KEYCLOAK_CLIENT_SECRET
    }
  }
};
```

Для поддержки нескольких realm одновременно можно реализовать динамический выбор:

```javascript
// Пример функции для определения realm по домену пользователя
function getRealmForUser(email) {
  const domain = email.split('@')[1];

  switch(domain) {
    case 'company-a.com':
      return 'realm-a';
    case 'company-b.com':
      return 'realm-b';
    default:
      return 'default-realm';
  }
}
```

## API

Приложение предоставляет следующие API-эндпоинты:

- `GET /api/user/profile` - получение профиля пользователя
- `POST /api/change-password` - изменение пароля
- `POST /api/unlock-account` - разблокировка аккаунта
- `POST /api/setup-mfa` - настройка MFA

## Вклад в развитие

1. Сделайте fork репозитория
2. Создайте ветку для новой функции (`git checkout -b feature/amazing-feature`)
3. Сделайте коммит изменений (`git commit -m 'Add some amazing feature'`)
4. Запушьте ветку (`git push origin feature/amazing-feature`)
5. Создайте Pull Request

## Лицензия

Этот проект распространяется по лицензии MIT. Смотрите файл `LICENSE` для получения дополнительной информации.