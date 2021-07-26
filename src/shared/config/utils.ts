import {
  IAppCredentials,
  TAppEnvironment,
  TNodeEnvironment,
} from '~/shared/types';
import {isBoolean, isString, isUndefined} from '~/shared/utils';
import {IConfig} from '~/shared/config/types';
import {Container} from 'typedi';
import {ConfigToken} from '~/shared/di';

interface IGetStringOptions {
  defaultValue?: string;
}

interface IGetNumberOptions {
  defaultValue?: number;
  type?: 'negative' | 'positive';
}

interface IGetBooleanOptions {
  defaultValue?: boolean;
}

interface IGetAppEnvironmentOptions {
  defaultValue?: TAppEnvironment;
}

interface IGetNodeEnvironmentOptions {
  defaultValue?: TNodeEnvironment;
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
export function getNumber(
  variableName: string,
  options: IGetNumberOptions = {},
): number {
  const {defaultValue, type} = options;
  const value = Number(process.env[variableName]);

  if (
    Number.isNaN(value) ||
    (type === 'negative' && value >= 0) ||
    (type === 'positive' && value <= 0)
  ) {
    if (isUndefined(defaultValue)) {
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
export function getString(
  variableName: string,
  options: IGetStringOptions = {},
): string {
  const {defaultValue} = options;
  const value = process.env[variableName];

  if (isString(value)) {
    return value;
  }
  if (isString(defaultValue)) {
    return defaultValue;
  }
  throw createError(variableName);
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
 * Парсит переменную окружения как среду запуска приложения.
 * @param variableName
 * @param options
 */
export function getNodeEnvironment(
  variableName: string,
  options: IGetNodeEnvironmentOptions = {},
): TNodeEnvironment {
  const {defaultValue} = options;
  const value = process.env[variableName];

  if (isString(value)) {
    if (['development', 'production'].includes(value)) {
      return value as TNodeEnvironment;
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
  if (!isUndefined(defaultValue)) {
    return defaultValue;
  }
  throw createError(variableName);
}

/**
 * Возвращает конфиг в котором скрыты чувствительные данные.
 */
export function getSecuredConfig(): IConfig {
  const {
    vkAppCredentials,
    ...rest
  } = Container.get(ConfigToken);

  return {
    ...rest,
    sentryDsn: 'hidden',
    vkAppCredentials: vkAppCredentials.map(c => ({
      appId: c.appId,
      secretKey: 'hidden',
    })),
  };
}