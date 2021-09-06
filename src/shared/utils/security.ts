import {ParsedUrlQuery} from 'querystring';
import {createHmac} from 'crypto';
import {TLang} from '~/shared/types';
import {isNumber, isString} from '~/shared/utils';
import {Container} from 'typedi';
import {ConfigToken} from '~/shared/di';
import {AuthorizationError} from '~/shared/errors';

/**
 * Подтвержденные параметры запуска.
 */
export interface IVerifiedLaunchParams {
  userId: number;
  lang: TLang;
  appId: number;
}

/**
 * Список известных языков.
 */
const languages: TLang[] = [
  'ru', 'uk', 'ua', 'be', 'en', 'es', 'fi', 'de', 'it', 'kz', 'pt',
];

interface IParseQueryResult {
  params: Record<string, string>;
  sign?: string;
}

/**
 * Утверждает что значение является языком.
 * @param value
 */
function isLang(value: any): value is TLang {
  return languages.includes(value);
}

/**
 * Принимает query и возвращает список параметров запуска вместе с
 * подписью, если она была передана.
 * @param searchOrParsedUrlQuery
 */
function parseQuery(
  searchOrParsedUrlQuery: string | ParsedUrlQuery,
): IParseQueryResult {
  const result: IParseQueryResult = {params: {}};

  /**
   * Функция, которая обрабатывает входящий query-параметр. В случае передачи
   * параметра, отвечающего за подпись, подменяет "sign". В случае встречи
   * корректного в контексте подписи параметра, добавляет его в массив
   * известных параметров.
   * @param key
   * @param value
   */
  const processQueryParam = (key: string, value: any) => {
    if (typeof value === 'string') {
      if (key === 'sign') {
        result.sign = value;
      } else if (key.startsWith('vk_')) {
        result.params[key] = value;
      }
    }
  };

  if (typeof searchOrParsedUrlQuery === 'string') {
    const questionIndex = searchOrParsedUrlQuery.indexOf('?');

    if (questionIndex >= 0) {
      searchOrParsedUrlQuery = searchOrParsedUrlQuery.slice(questionIndex + 1);
    }

    // Пытаемся спарсить строку, как query-параметр.
    for (const param of searchOrParsedUrlQuery.split('&')) {
      const [key, value] = param.split('=');
      processQueryParam(key, value);
    }
  } else {
    for (const key in searchOrParsedUrlQuery) {
      processQueryParam(key, searchOrParsedUrlQuery[key]);
    }
  }
  return result;
}

/**
 * Верифицирует параметры запуска.
 * @param searchOrParsedUrlQuery
 */
export function verifyLaunchParams(
  searchOrParsedUrlQuery: string | ParsedUrlQuery,
): IVerifiedLaunchParams {
  const {
    vkAppCredentials,
    vkLaunchParamsExpiration,
  } = Container.get(ConfigToken);
  const {params, sign} = parseQuery(searchOrParsedUrlQuery);
  const keys = Object.keys(params);

  // Обрабатываем исключительный случай, когда подпись в параметрах не найдена,
  // а также не найден ни один параметр, начинающийся с "vk_", дабы избежать
  // излишней нагрузки образующейся в процессе работы дальнейшего кода.
  if (!isString(sign) || keys.length === 0) {
    throw new AuthorizationError('Параметры запуска имеют некорректный формат');
  }

  // Если необходима проверка на истечение срока годности параметров запуска,
  // осуществляем её.
  if (isNumber(vkLaunchParamsExpiration)) {
    const timestamp = Number(params.vk_ts);

    if (
      Number.isNaN(timestamp) ||
      Date.now() - timestamp * 1000 > vkLaunchParamsExpiration
    ) {
      throw new AuthorizationError('Время действия параметров запуска истекло');
    }
  }
  const appId = Number(params.vk_app_id);
  const userId = Number(params.vk_user_id);
  const lang = params.vk_language;

  if (Number.isNaN(appId) || Number.isNaN(userId) || !isLang(lang)) {
    throw new AuthorizationError(
      'В параметрах запуска отсутствуют необходимые данные',
    );
  }
  // Снова создаем query в виде строки из уже отфильтрованных параметров.
  const queryString = keys
    // Сортируем ключи в порядке возрастания.
    .sort((a, b) => a.localeCompare(b))
    // Воссоздаем новый query в виде строки.
    .reduce<string>((acc, key, idx) => {
      return acc + (idx === 0 ? '' : '&') + `${key}=${encodeURIComponent(params[key])}`;
    }, '');

  // Проверяем, подходят ли созданные параметры запуска под какие-либо
  // известные паспорта.
  const isValid = vkAppCredentials.some(cred => {
    const {secretKey} = cred;

    if (appId !== cred.appId) {
      return false;
    }
    // Создаем хэш на основе секретного ключа.
    const paramsHash = createHmac('sha256', secretKey)
      .update(queryString)
      .digest()
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=$/, '');

    // Сравниваем его с подписью.
    return paramsHash === sign;
  });

  if (!isValid) {
    throw new AuthorizationError('Подпись параметров запуска невалидна');
  }
  return {userId, lang, appId};
}