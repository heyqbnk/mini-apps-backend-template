import * as Sentry from '@sentry/node';
import {Severity} from '@sentry/node';

/**
 * Создает функцию, которая отлавливает ошибку при помощи Sentry и логирует её
 * в консоль.
 * @param {Severity} severity
 * @returns {(e: Error) => void}
 */
export function createErrorCatcher(severity = Severity.Error) {
  return (e: Error) => {
    console.error(e);
    Sentry.captureException(e, scope => scope.setLevel(severity));
  };
}

/**
 * Функция для отлова критических ошибок.
 * @type {(e: Error) => void}
 */
export const fatalErrorCatcher = createErrorCatcher(Severity.Fatal);

/**
 * Функция для отлова обычных ошибок.
 */
export const defaultErrorCatcher = createErrorCatcher(Severity.Error);

/**
 * Функция для отлова ошибок-предупреждений.
 * @type {(e: Error) => void}
 */
export const warningErrorCatcher = createErrorCatcher(Severity.Warning);