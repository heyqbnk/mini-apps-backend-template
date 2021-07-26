import {IConfig} from './types';
import {
  getAppCredentials, getAppEnvironment,
  getBoolean, getNodeEnvironment,
  getNumber,
  getString,
} from './utils';
import path from 'path';
import dotenv from 'dotenv';
import packageJson from '../../../package.json';

// Получаем переменные окружения из файла.
dotenv.config({path: path.resolve(__dirname, '../../../.env')});

const appEnv = getAppEnvironment('APP_ENV');
const appId = getNumber('APP_ID');
const enableCors = getBoolean('ENABLE_CORS', {defaultValue: false});
const enableMultiThread = getBoolean('ENABLE_MULTI_THREAD', {defaultValue: true});
const enableLaunchParamsExpiration = getBoolean('ENABLE_LAUNCH_PARAMS_EXPIRATION', {defaultValue: true});
const port = getNumber('PORT');
const sentryDsn = getString('SENTRY_DSN', {
  // В production и staging окружениях обязательно требуем sentry.
  defaultValue: appEnv === 'local' ? '' : undefined,
});
const gqlPublicHttpEndpoint = getString('GQL_PUBLIC_HTTP_ENDPOINT', {defaultValue: '/gql'});
const gqlAdminHttpEndpoint = getString('GQL_ADMIN_HTTP_ENDPOINT', {defaultValue: '/gql-adm'});
const nodeEnv = getNodeEnvironment('NODE_ENV', {defaultValue: 'production'});
const vkAppCredentials = getAppCredentials('VK_APP_CREDENTIALS');

export const config: IConfig = {
  appEnv,
  appId,
  port,
  release: packageJson.version + '-' + appEnv,
  sentryDsn: sentryDsn === '' ? null : sentryDsn,
  gqlPublicHttpEndpoint,
  gqlAdminHttpEndpoint,
  enableCors,
  enableMultiThread,
  enableLaunchParamsExpiration,
  nodeEnv,
  vkAppCredentials,
};
