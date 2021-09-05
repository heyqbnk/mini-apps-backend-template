import {MiddlewareFn} from 'type-graphql';
import {IContext} from '~/api/gql/types';
import * as Sentry from '@sentry/node';
import {isServerError} from '~/shared/errors';

/**
 * Отлавливает ошибку, возникающую в процессе выполнения обработки запроса
 * и отправляет её в Sentry наполняя при этом необходимыми для диагностики
 * данными.
 * @param _
 * @param next
 * @constructor
 */
export const SentryMiddleware: MiddlewareFn<IContext> =
  async (_, next) => {
    try {
      return await next();
    } catch (e) {
      Sentry.captureException(e, scope => {
        // Если эта ошибка была выброшена нами, то необходимо извлечь
        // из нее контекстную информацию.
        if (isServerError(e) && e.sentryContext !== undefined) {
          for (const context in e.sentryContext) {
            scope.setContext(context, e.sentryContext[context]);
          }
        }
        return scope;
      });
      throw e;
    }
  };