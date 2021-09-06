/**
 * Список доступных сред запуска приложения.
 */
export type TAppEnvironment = 'local' | 'staging' | 'production';

/**
 * Список известных языков.
 * @see vk_language в https://vk.com/dev/vk_apps_docs3?f=6.%2B%D0%9F%D0%B0%D1%80%D0%B0%D0%BC%D0%B5%D1%82%D1%80%D1%8B%2B%D0%B7%D0%B0%D0%BF%D1%83%D1%81%D0%BA%D0%B0
 */
export type TLang = 'ru' | 'uk' | 'ua' | 'be' | 'en' | 'es' | 'fi' | 'de' | 'it' | 'kz' | 'pt';

/**
 * Объект, в котором в качестве appId указан идентификатор приложения,
 * а secretKey - его секретный ключ для создания подписи.
 */
export interface IAppCredentials {
  appId: number;
  secretKey: string;
}
