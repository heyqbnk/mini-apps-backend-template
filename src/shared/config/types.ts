import {IAppCredentials, TAppEnvironment} from '~/shared/types';

/**
 * Конфигурация проекта.
 */
export interface IConfig {
  /**
   * Среда выполнения приложения.
   */
  appEnv: TAppEnvironment;
  /**
   * Необходимо ли включить CORS на сервере.
   */
  enableCors: boolean,
  /**
   * Порт для запуска сервера.
   */
  port: number;
  /**
   * Идентификатор релиза, который используется в сентри.
   */
  sentryRelease: string;
  /**
   * Sentry DSN для логирования ошибок.
   */
  sentryDsn: string | null;
  /**
   * Маршрут для доступа к публичной HTTP-ручке.
   */
  gqlPublicHttpEndpoint: string;
  /**
   * Маршрут для доступа к публичным подпискам.
   */
  gqlPublicWsEndpoint: string | null;
  /**
   * Маршрут для доступа к админской HTTP-ручке.
   */
  gqlAdminHttpEndpoint: string;
  /**
   * Маршрут для доступа к админским подпискам.
   */
  gqlAdminWsEndpoint: string | null;
  /**
   * Максимальное количество потоков, в котором должен запуститься сервер.
   */
  maxThreadsCount: number;
  /**
   * Максимальное количество запросов в секунду, которое может быть совершено
   * от лица приложения.
   */
  vkAppApiRps: number;
  /**
   * Сервисный токен доступа приложения для выполнения запросов к API
   * ВКонтакте.
   */
  vkAppApiAccessToken: string;
  /**
   * Список паспортных данных приложений, которые имеют доступ к этому API.
   */
  vkAppCredentials: IAppCredentials[];
  /**
   * Идентификатор приложения VK Mini Apps который ассоциируется с этим
   * сервером.
   */
  vkAppId: number;
  /**
   * Максимальный срок жизни параметров запуска VK Mini Apps.
   */
  vkLaunchParamsExpiration: number;
}