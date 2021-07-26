import {Token} from 'typedi';
import {IConfig} from '~/shared/config';

/**
 * Токен для получения конфига приложения.
 */
export const ConfigToken = new Token<IConfig>();
