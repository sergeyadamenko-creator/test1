# Архитектура MFA Self-Service Portal

## Обзор

Этот проект представляет собой портал самообслуживания для управления учетными записями пользователей, включая смену пароля, разблокировку аккаунтов и настройку двухфакторной аутентификации (MFA).

## Компоненты системы

### 1. Frontend (React)
- SPA-приложение на React
- Роутинг с помощью React Router
- Состояние аутентификации хранится в localStorage
- Стилизация с помощью CSS

### 2. Backend (Node.js + Express)
- API-сервер с аутентификацией через Keycloak
- Защита маршрутов с помощью Keycloak middleware
- Интеграция с Keycloak Admin API для операций управления

### 3. Identity Provider (Keycloak)
- Центральный провайдер идентичности
- Управление пользователями, ролями и правами доступа
- Поддержка протоколов OAuth2 и OpenID Connect
- Встроенная поддержка MFA

## Интеграция с Keycloak для разных Realm

### Проблема
Каждое приложение может иметь свой собственный realm в Keycloak, что требует особого подхода для централизованного портала самообслуживания.

### Решения

#### 1. Единый Realm для всех пользователей
**Преимущества:**
- Простая реализация
- Единое место управления всеми пользователями
- Простой доступ к информации обо всех пользователях

**Недостатки:**
- Все пользователи видны в одном месте
- Может не соответствовать политике безопасности некоторых организаций

#### 2. Множественные Realm с общим Client ID
**Преимущества:**
- Каждое приложение может иметь свой realm
- Сохраняется изоляция данных между приложениями
- Возможность централизованного управления

**Реализация:**
- Создание доверенного клиента (trusted client) в каждом realm
- Использование единого сервисного аккаунта для доступа к Admin API
- Централизованный портал использует токены доступа к каждому realm

#### 3. Cross-Realm Authentication
**Преимущества:**
- Полная изоляция realm друг от друга
- Сохранение существующей архитектуры

**Недостатки:**
- Более сложная реализация
- Требуется дополнительная настройка в Keycloak

### Рекомендуемая архитектура для множественных Realm

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Realm A       │    │   Realm B       │    │   Realm C       │
│                 │    │                 │    │                 │
│  Users:         │    │  Users:         │    │  Users:         │
│  - user_a       │    │  - user_b       │    │  - user_c       │
│  - admin_a      │    │  - admin_b      │    │  - admin_c      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
           │                      │                      │
           └──────────────────────┼──────────────────────┘
                                  │
                    ┌─────────────────────────┐
                    │  Self-Service Portal   │
                    │                       │
                    │  - Change Password    │
                    │  - Unlock Account     │
                    │  - Setup MFA          │
                    │                       │
                    └─────────────────────────┘
```

## Конфигурация для разных Realm

### 1. Файл конфигурации
Файл `keycloak-config.js` позволяет настраивать подключение к разным realm в зависимости от окружения.

### 2. Dynamic Realm Selection
Для поддержки нескольких realm одновременно можно реализовать динамический выбор realm на основе домена пользователя или другого идентификатора:

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

### 3. Multi-tenant Architecture
Для более сложных сценариев можно реализовать мультитенантную архитектуру:

```javascript
class KeycloakManager {
  constructor() {
    this.realms = new Map();
    this.initRealms();
  }
  
  initRealms() {
    // Загрузка конфигураций для всех поддерживаемых realm
    const configs = loadRealmConfigs();
    configs.forEach(config => {
      this.realms.set(config.realmName, new KeycloakClient(config));
    });
  }
  
  getClientForUser(userEmail) {
    const realm = this.getRealmForUser(userEmail);
    return this.realms.get(realm);
  }
}
```

## Безопасность

### 1. Защита API
- Все API защищены с помощью Keycloak middleware
- Использование JWT-токенов для аутентификации
- Ограничение доступа к чувствительным операциям

### 2. Управление привилегиями
- Использование ролей Keycloak для ограничения доступа
- Разделение прав между обычными пользователями и администраторами
- Логирование всех операций управления

### 3. Шифрование
- Все токены хранятся в безопасном хранилище
- Использование HTTPS для всех соединений
- Шифрование конфиденциальных данных

## Развертывание

### 1. Docker
Для упрощения развертывания рекомендуется использовать Docker:

```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3001

CMD ["node", "server.js"]
```

### 2. Environment Variables
Использование переменных окружения для настройки приложения:

```
NODE_ENV=production
KEYCLOAK_BASE_URL=https://sso.company.com
KEYCLOAK_CLIENT_ID=self-service-portal
KEYCLOAK_CLIENT_SECRET=******
PORT=3001
```

## API Reference

### User Profile
```
GET /api/user/profile
Authorization: Bearer <access_token>
```

### Change Password
```
POST /api/change-password
Content-Type: application/json
Authorization: Bearer <access_token>

{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}
```

### Unlock Account
```
POST /api/unlock-account
Content-Type: application/json
Authorization: Bearer <access_token>

{
  "username": "user_to_unlock"
}
```

### Setup MFA
```
POST /api/setup-mfa
Content-Type: application/json
Authorization: Bearer <access_token>

{
  "method": "totp",
  "phoneNumber": "+1234567890" // для SMS
}
```

## Заключение

Предложенная архитектура обеспечивает гибкость и масштабируемость для работы с несколькими realm Keycloak, позволяя создать единый портал самообслуживания для управления учетными записями пользователей.