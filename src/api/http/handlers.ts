import {ErrorRequestHandler, RequestHandler} from 'express';
import * as Sentry from '@sentry/node';
import {parse, ParsedUrlQuery} from 'querystring';
import {IAuthorizedLocals, isAuthorizedLocals} from '~/api/shared';
import {verifyLaunchParams} from '~/shared/utils';
import {isServerError} from '~/shared/errors';

interface IAuthorizedRequestHandler extends RequestHandler<Record<any, any>, any, any, ParsedUrlQuery, IAuthorizedLocals> {
}

/**
 * Имя заголовка в котором записаны параметры запуска.
 */
const LAUNCH_PARAMS_HEADER_NAME = 'x-launch-params';

/**
 * Обработчик ошибок по умолчанию. Необходим в случае, когда клиент присылает
 * битые данные и тогда сервер отправляя в ответ сгенерированную ошибку
 * раскрывает внутренние пути.
 * @param err
 * @param req
 * @param res
 * @param next
 */
export const defaultErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({message: 'Неизвестная ошибка'});
};


/**
 * Промежуточный обработчик, который помещает в запрос информацию о
 * параметрах запуска.
 * @param req
 * @param res
 * @param next
 */
export const launchParamsHandler: RequestHandler<Record<any, any>, any, any, ParsedUrlQuery, Record<string, any>> = (
  req,
  res,
  next,
) => {
  let launchParamsStrOrQuery: ParsedUrlQuery | string =
    req.header(LAUNCH_PARAMS_HEADER_NAME) || '';

  if (launchParamsStrOrQuery === '') {
    launchParamsStrOrQuery = req.query;
  }

  try {
    const locals: IAuthorizedLocals = res.locals as IAuthorizedLocals;

    // Помещаем параметры запуска в локальные переменные объекта ответа.
    locals.launchParams = verifyLaunchParams(launchParamsStrOrQuery);
    locals.launchParamsQuery = typeof launchParamsStrOrQuery === 'string'
      ? parse(launchParamsStrOrQuery)
      : launchParamsStrOrQuery;
    next();
  } catch (e) {
    // Ошибка, которая была выброшена нами.
    if (isServerError(e)) {
      res.status(401).json({message: e.message});
      return;
    }
    res.status(500).json({message: 'Что-то пошло не так'});
  }
};

/**
 * Обработчик, который производит первичную настройку Sentry.
 * @param req
 * @param res
 * @param next
 */
export const sentryHandler: IAuthorizedRequestHandler = async (
  req,
  res,
  next,
) => {
  if (isAuthorizedLocals(res.locals)) {
    const {launchParams, launchParamsQuery} = res.locals;

    // С момента, как пользователь авторизован, конфигурируем для него Sentry
    // scope.
    Sentry.configureScope(scope => {
      // Устанавливаем пользователя.
      scope.setUser({id: launchParams.userId.toString()});

      // Добавляем параметры запуска пользователя.
      scope.setContext('Launch Parameters', launchParamsQuery);
    });
  }

  next();
};
