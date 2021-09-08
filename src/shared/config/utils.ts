import {IAppCredentials, TAppEnvironment} from '~/shared/types';
import {isBoolean, isString} from '~/shared/utils';
import {IConfig} from '~/shared/config/types';
import {Container} from 'typedi';
import {ConfigToken} from '~/shared/di';

interface IGetStringOptions<Default = string> {
  defaultValue?: Default;
}

interface IGetNumberOptions<Default = number> {
  defaultValue?: Default;
  type?: 'negative' | 'positive';
}

interface IGetBooleanOptions {
  defaultValue?: boolean;
}

interface IGetAppEnvironmentOptions {
  defaultValue?: TAppEnvironment;
}

interface IGetAppCredentialsOptions {
  defaultValue?: IAppCredentials[];
}

/**
 * Создает ошибку для указанной переменной среды.
 * @param envName
 */
function createError(envName: string) {
  return new Error(
    `Переменная окружения ${envName} не передана или имеет некорректный формат`,
  );
}

/**
 * Парсит переменную окружения как число.
 * @param variableName
 * @param options
 */
export function getNumber<Default = number>(
  variableName: string,
  options: IGetNumberOptions<Default> = {},
): number | Default {
  const {defaultValue, type} = options;
  const value = Number(process.env[variableName]);

  if (
    Number.isNaN(value) ||
    (type === 'negative' && value >= 0) ||
    (type === 'positive' && value <= 0)
  ) {
    if (defaultValue === undefined) {
      throw createError(variableName);
    }
    return defaultValue;
  }
  return value;
}

/**
 * Парсит переменную окружения как строку.
 * @param variableName
 * @param options
 */
export function getString<Default = string>(
  variableName: string,
  options: IGetStringOptions<Default> = {},
): string | Default {
  const {defaultValue} = options;
  const value = process.env[variableName];

  if (isString(value)) {
    return value;
  }
  if (defaultValue === undefined) {
    throw createError(variableName);
  }
  return defaultValue;
}

/**
 * Парсит переменную окружения как булево значение.
 * @param variableName
 * @param options
 */
export function getBoolean(
  variableName: string,
  options: IGetBooleanOptions = {},
): boolean {
  const {defaultValue} = options;
  const value = process.env[variableName];

  if (isString(value)) {
    return value === '1';
  }
  if (isBoolean(defaultValue)) {
    return defaultValue;
  }
  throw createError(variableName);
}

/**
 * Парсит переменную окружения как среду запуска приложения.
 * @param variableName
 * @param options
 */
export function getAppEnvironment(
  variableName: string,
  options: IGetAppEnvironmentOptions = {},
): TAppEnvironment {
  const {defaultValue} = options;
  const value = process.env[variableName];

  if (isString(value)) {
    if (['local', 'staging', 'production'].includes(value)) {
      return value as TAppEnvironment;
    }
    throw createError(variableName);
  }
  if (isString(defaultValue)) {
    return defaultValue;
  }
  throw createError(variableName);
}

/**
 * Возвращает аутентификационные данные для приложений.
 * @param variableName
 * @param options
 */
export function getAppCredentials(
  variableName: string,
  options: IGetAppCredentialsOptions = {},
): IAppCredentials[] {
  const {defaultValue} = options;
  const value = process.env[variableName];

  if (isString(value)) {
    const parsed = value.split(',').map(cred => {
      const [appIdStr, secretKey = ''] = cred.split(':');
      const appId = Number(appIdStr);

      if (Number.isNaN(appId) || secretKey.length === 0) {
        throw createError(variableName);
      }
      return {appId, secretKey};
    });

    if (parsed.length === 0) {
      throw createError(variableName);
    }
    return parsed;
  }
  if (defaultValue !== undefined) {
    return defaultValue;
  }
  throw createError(variableName);
}

/**
 * Возвращает конфиг в котором скрыты чувствительные данные.
 */
export function getSecuredConfig(): IConfig {
  const {vkAppCredentials, ...rest} = Container.get(ConfigToken);

  return {
    ...rest,
    sentryDsn: 'hidden',
    vkAppApiAccessToken: 'hidden',
    vkAppCredentials: vkAppCredentials.map(({appId}) => ({
      appId,
      secretKey: 'hidden',
    })),
  };
}