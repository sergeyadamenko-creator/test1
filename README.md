# B1 ID Portal

B1 ID Portal - это портал самообслуживания, где пользователи могут изменить пароль, разблокировать свою учетную запись и настроить двухфакторную аутентификацию (2FA).

## Особенности

- Изменение пароля
- Разблокировка аккаунта
- Настройка 2FA (TOTP и SMS)
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

### Быстрая установка с помощью git clone

Чтобы быстро установить и настроить B1 ID Portal на вашей целевой машине, используйте следующую команду:

```bash
git clone https://github.com/your-repo/b1-id-portal.git
cd b1-id-portal
npm install
npm run build
npm start
```

### Установка с использованием скрипта

Вы также можете использовать скрипт установки:

```bash
curl -o install.sh https://raw.githubusercontent.com/your-repo/b1-id-portal/main/install.sh
chmod +x install.sh
./install.sh [repository-url] [target-directory]
```

### Ручная установка

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

## Запуск с помощью Docker

Приложение можно запустить с использованием Docker и Docker Compose:

```bash
# Клонируйте репозиторий
git clone https://github.com/your-repo/b1-id-portal.git
cd b1-id-portal

# Запустите сервисы (включая Keycloak)
docker-compose up -d

# Приложение будет доступно по адресу http://localhost:3000
# Keycloak будет доступен по адресу http://localhost:8080
```

Для остановки сервисов используйте:
```bash
docker-compose down
```

## Конфигурация

Создайте файл `.env` в корневом каталоге с следующими переменными:

```env
KEYCLOAK_BASE_URL=http://localhost:8080
KEYCLOAK_ADMIN_USERNAME=admin
KEYCLOAK_ADMIN_PASSWORD=admin
KEYCLOAK_REALM=your-realm-name
PORT=3000
```

## Использование

После запуска приложение будет доступно по адресу http://localhost:3000

Для тестирования функционала:
1. Перейдите на страницу входа
2. Войдите с тестовыми учетными данными
3. Используйте навигацию для доступа к различным функциям

## Настройка 2FA через Keycloak

Архитектурно, для каждого приложения с отдельным realm, 2FA настраивается следующим образом:

1. **Единый Self-Service Portal** интегрируется с каждым realm Keycloak
2. Для каждого realm настраиваются доверенные клиенты (trusted clients)
3. Используется единый сервисный аккаунт для доступа к Admin API
4. При регистрации или изменении настроек MFA, Self-Service Portal взаимодействует с соответствующим realm

### Поддержка нескольких Realm

В файле `keycloak-config.js` можно настроить конфигурации для разных окружений и realm:

```javascript
const keycloakConfig = {
  development: {
    clientId: 'b1-id-portal-dev',
    realm: 'self-service-realm',
    baseUrl: 'http://localhost:8080',
    authUrl: '/realms/self-service-realm/protocol/openid-connect',
    adminUrl: '/admin/realms/self-service-realm',
    credentials: {
      secret: 'your-client-secret'
    }
  },
  production: {
    clientId: 'b1-id-portal-prod',
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
- `POST /api/setup-mfa` - настройка 2FA

## Вклад в развитие

1. Сделайте fork репозитория
2. Создайте ветку для новой функции (`git checkout -b feature/amazing-feature`)
3. Сделайте коммит изменений (`git commit -m 'Add some amazing feature'`)
4. Запушьте ветку (`git push origin feature/amazing-feature`)
5. Создайте Pull Request

## Лицензия

Этот проект распространяется по лицензии MIT. Смотрите файл `LICENSE` для получения дополнительной информации.