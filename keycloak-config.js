// Конфигурационный файл для подключения к Keycloak
// Этот файл содержит настройки для разных окружений

const keycloakConfig = {
  development: {
    clientId: 'b1-id-portal-dev',
    realm: 'self-service-realm',
    baseUrl: 'http://localhost:8080',
    authUrl: '/realms/self-service-realm/protocol/openid-connect',
    adminUrl: '/admin/realms/self-service-realm',
    credentials: {
      secret: 'your-client-secret' // Не использовать в продакшене без шифрования
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

// Функция получения конфигурации в зависимости от окружения
function getConfig(environment = process.env.NODE_ENV || 'development') {
  const config = keycloakConfig[environment];
  if (!config) {
    throw new Error(`Configuration for environment '${environment}' not found`);
  }
  return config;
}

module.exports = {
  keycloakConfig,
  getConfig
};