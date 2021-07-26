import {
  IAppCredentials,
  TAppEnvironment,
  TNodeEnvironment,
} from '~/shared/types';

/**
 * Конфигурация проекта.
 */
export interface IConfig {
  appEnv: TAppEnvironment;
  appId: number;
  enableCors: boolean,
  enableMultiThread: boolean;
  enableLaunchParamsExpiration: boolean;
  port: number;
  release: string;
  sentryDsn: string | null;
  gqlPublicHttpEndpoint: string;
  gqlAdminHttpEndpoint: string;
  nodeEnv: TNodeEnvironment;
  vkAppCredentials: IAppCredentials[];
}