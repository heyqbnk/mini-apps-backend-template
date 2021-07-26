import {EError} from '~/shared/errors';
import {Contexts, Context} from '@sentry/types';

/**
 * Ошибка, успешно сформированная сервером.
 */
class ServerError extends Error {
  constructor(
    message: string,
    public name: EError,
    public sentryContext?: Contexts,
  ) {
    super(message || '');

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ServerError);
    }
    Object.setPrototypeOf(this, ServerError.prototype);
  }

  /**
   * Добавляет в ошибку контекст.
   * @param name
   * @param context
   */
  addContext(name: string, context: Context): this {
    if (this.sentryContext === undefined) {
      this.sentryContext = {};
    }
    while (name in this.sentryContext) {
      name = '_' + name;
    }
    this.sentryContext[name] = context;

    return this;
  }
}

/**
 * Утверждает, что e является обработанной ошибкой.
 * @param e
 */
export function isServerError(e: any): e is ServerError {
  return e instanceof ServerError;
}

/**
 * Создает выбрасываемую ошибку, которая была успешно сформирована сервером.
 * @param name
 * @param defaultMessage
 */
export function createError(name: EError, defaultMessage: string) {
  return class extends ServerError {
    constructor(
      message?: string | null,
      sentryContext?: Contexts,
    ) {
      super(message || defaultMessage, name, sentryContext);
    }
  };
}