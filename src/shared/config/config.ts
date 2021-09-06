import {IConfig} from './types';
import {
  getAppCredentials, getAppEnvironment,
  getBoolean,
  getNumber,
  getString,
} from './utils';
import path from 'path';
import dotenv from 'dotenv';
import packageJson from '../../../package.json';

// Получаем переменные окружения из файла.
dotenv.config({path: path.resolve(__dirname, '../../../.env')});

const appEnv = getAppEnvironment('APP_ENV');
const enableCors = getBoolean('ENABLE_CORS', {defaultValue: false});
const gqlPublicHttpEndpoint = getString('GQL_PUBLIC_HTTP_ENDPOINT', {defaultValue: '/gql'});
const gqlPublicWsEndpoint = getString('GQL_PUBLIC_WS_ENDPOINT', {defaultValue: null});
const gqlAdminHttpEndpoint = getString('GQL_ADMIN_HTTP_ENDPOINT', {defaultValue: '/gql-adm'});
const gqlAdminWsEndpoint = getString('GQL_ADMIN_WS_ENDPOINT', {defaultValue: null});
const maxThreadsCount = getNumber('MAX_THREADS_COUNT', {
  defaultValue: 1,
  type: 'positive',
});
const port = getNumber('PORT');
const sentryDsn = getString('SENTRY_DSN', {
  // В production и staging окружениях обязательно требуем sentry.
  defaultValue: appEnv === 'production' || appEnv === 'staging'
    ? undefined
    : '',
});
const vkAppApiAccessToken = getString('VK_APP_API_ACCESS_TOKEN');
const vkAppApiRps = getNumber('VK_APP_API_RPS', {
  defaultValue: 3,
  type: 'positive',
});
const vkAppCredentials = getAppCredentials('VK_APP_CREDENTIALS');
const vkAppId = getNumber('VK_APP_ID');
const vkLaunchParamsExpiration = getNumber('VK_LAUNCH_PARAMS_EXPIRATION', {
  defaultValue: 24 * 60 * 60,
  type: 'positive',
});

export const config: IConfig = {
  appEnv,
  enableCors,
  gqlPublicHttpEndpoint,
  gqlPublicWsEndpoint,
  gqlAdminHttpEndpoint,
  gqlAdminWsEndpoint,
  maxThreadsCount,
  port,
  sentryDsn: sentryDsn === '' ? null : sentryDsn,
  sentryRelease: packageJson.version + '-' + appEnv,
  vkAppApiAccessToken,
  vkAppApiRps,
  vkAppCredentials,
  vkAppId,
  vkLaunchParamsExpiration: vkLaunchParamsExpiration * 1000,
};
