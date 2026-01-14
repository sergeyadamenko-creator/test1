/**
 * Пример использования Keycloak Admin API для операций управления
 * 
 * Этот файл демонстрирует, как можно использовать Keycloak Admin API
 * для выполнения операций, таких как смена пароля, разблокировка аккаунта
 * и настройка MFA в контексте нескольких realm.
 */

const axios = require('axios');

class KeycloakAdminClient {
  constructor(config) {
    this.baseUrl = config.baseUrl;
    this.realm = config.realm;
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.accessToken = null;
    this.tokenExpirationTime = 0;
  }

  /**
   * Получение администраторского токена
   */
  async getAdminToken() {
    const now = Date.now();
    
    // Если токен ещё действителен, используем его
    if (this.accessToken && now < this.tokenExpirationTime) {
      return this.accessToken;
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/realms/master/protocol/openid-connect/token`,
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.clientId,
          client_secret: this.clientSecret
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      this.accessToken = response.data.access_token;
      // Устанавливаем время истечения токена с небольшим запасом
      this.tokenExpirationTime = now + (response.data.expires_in * 1000) - 60000; // за минуту до истечения
      
      return this.accessToken;
    } catch (error) {
      console.error('Error getting admin token:', error.message);
      throw error;
    }
  }

  /**
   * Поиск пользователя по имени
   */
  async findUserByUsername(username) {
    const token = await this.getAdminToken();
    
    try {
      const response = await axios.get(
        `${this.baseUrl}/admin/realms/${this.realm}/users`,
        {
          params: {
            username: username,
            exact: true
          },
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      return response.data.length > 0 ? response.data[0] : null;
    } catch (error) {
      console.error('Error finding user:', error.message);
      throw error;
    }
  }

  /**
   * Смена пароля пользователя
   */
  async changeUserPassword(userId, newPassword, temporary = false) {
    const token = await this.getAdminToken();
    
    try {
      await axios.put(
        `${this.baseUrl}/admin/realms/${this.realm}/users/${userId}/reset-password`,
        {
          type: 'password',
          value: newPassword,
          temporary: temporary
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (error) {
      console.error('Error changing password:', error.message);
      throw error;
    }
  }

  /**
   * Разблокировка аккаунта пользователя (очистка статистики неудачных попыток входа)
   */
  async unlockUserAccount(userId) {
    const token = await this.getAdminToken();
    
    try {
      await axios.delete(
        `${this.baseUrl}/admin/realms/${this.realm}/users/${userId}/logout`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Также можем сбросить статистику неудачных попыток
      await axios.put(
        `${this.baseUrl}/admin/realms/${this.realm}/users/${userId}/execute-actions-email`,
        ['UPDATE_PASSWORD'], // Это может быть другое действие в зависимости от настроек
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (error) {
      console.error('Error unlocking account:', error.message);
      throw error;
    }
  }

  /**
   * Получение настроек аутентификации пользователя (включая MFA)
   */
  async getUserAuthenticationSettings(userId) {
    const token = await this.getAdminToken();
    
    try {
      const [credentialsResponse, federatedIdentitiesResponse] = await Promise.all([
        axios.get(
          `${this.baseUrl}/admin/realms/${this.realm}/users/${userId}/credentials`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        ),
        axios.get(
          `${this.baseUrl}/admin/realms/${this.realm}/users/${userId}/federated-identity`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )
      ]);

      return {
        credentials: credentialsResponse.data,
        federatedIdentities: federatedIdentitiesResponse.data
      };
    } catch (error) {
      console.error('Error getting authentication settings:', error.message);
      throw error;
    }
  }

  /**
   * Настройка MFA для пользователя
   */
  async configureUserMFA(userId, mfaType = 'totp') {
    const token = await this.getAdminToken();
    
    try {
      // Для TOTP нужно создать credential
      if (mfaType === 'totp') {
        // Сначала удаляем существующие TOTP credentials
        const userCredentials = await this.getUserAuthenticationSettings(userId);
        const totpCredentials = userCredentials.credentials.filter(cred => cred.type === 'totp');
        
        for (const cred of totpCredentials) {
          await axios.delete(
            `${this.baseUrl}/admin/realms/${this.realm}/users/${userId}/credentials/${cred.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
        }

        // Затем создаем новый TOTP credential
        // В реальной реализации здесь нужно будет сгенерировать секретный ключ
        // и предоставить QR-код пользователю для сканирования
        const secretKey = this.generateSecretKey();
        
        await axios.post(
          `${this.baseUrl}/admin/realms/${this.realm}/users/${userId}/configure-totp`,
          {
            type: 'totp',
            userLabel: 'MFA Setup',
            algorithm: 'HmacSHA1',
            digits: 6,
            period: 30,
            secret: secretKey
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      }
    } catch (error) {
      console.error('Error configuring MFA:', error.message);
      throw error;
    }
  }

  /**
   * Генерация секретного ключа для TOTP
   */
  generateSecretKey(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

/**
 * Менеджер для работы с несколькими Keycloak realm
 */
class MultiRealmKeycloakManager {
  constructor() {
    this.clients = new Map();
  }

  /**
   * Добавление клиента для конкретного realm
   */
  addRealm(name, config) {
    this.clients.set(name, new KeycloakAdminClient(config));
  }

  /**
   * Получение клиента для конкретного realm
   */
  getRealmClient(realmName) {
    return this.clients.get(realmName);
  }

  /**
   * Определение realm по email пользователя
   */
  getRealmForUser(email) {
    const domain = email.split('@')[1];
    
    // Пример логики определения realm по домену
    const realmMap = {
      'company-a.com': 'company-a-realm',
      'company-b.com': 'company-b-realm',
      'partner.com': 'partner-realm'
    };
    
    return realmMap[domain] || 'default-realm';
  }

  /**
   * Выполнение операции в нужном realm
   */
  async executeOperation(email, operation, ...args) {
    const realmName = this.getRealmForUser(email);
    const client = this.getRealmClient(realmName);
    
    if (!client) {
      throw new Error(`No client configured for realm: ${realmName}`);
    }
    
    // Сначала найдем пользователя по email
    const user = await client.findUserByUsername(email.split('@')[0]);
    if (!user) {
      throw new Error(`User not found: ${email}`);
    }
    
    // Выполним операцию
    return await client[operation](user.id, ...args);
  }
}

// Пример использования
/*
const multiRealmManager = new MultiRealmKeycloakManager();

// Добавляем конфигурации для разных realm
multiRealmManager.addRealm('company-a-realm', {
  baseUrl: 'http://localhost:8080',
  realm: 'company-a-realm',
  clientId: 'admin-cli',
  clientSecret: 'your-admin-cli-secret'
});

multiRealmManager.addRealm('company-b-realm', {
  baseUrl: 'http://localhost:8080',
  realm: 'company-b-realm',
  clientId: 'admin-cli',
  clientSecret: 'your-admin-cli-secret'
});

// Пример использования
async function example() {
  try {
    // Смена пароля для пользователя
    await multiRealmManager.executeOperation(
      'user@company-a.com', 
      'changeUserPassword', 
      'newSecurePassword123'
    );
    
    console.log('Password changed successfully');
    
    // Разблокировка аккаунта
    await multiRealmManager.executeOperation(
      'lockeduser@company-b.com', 
      'unlockUserAccount'
    );
    
    console.log('Account unlocked successfully');
  } catch (error) {
    console.error('Error:', error.message);
  }
}
*/

module.exports = {
  KeycloakAdminClient,
  MultiRealmKeycloakManager
};