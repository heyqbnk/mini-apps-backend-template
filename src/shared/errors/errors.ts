import {createError} from './utils';
import {EError} from './types';

export const AuthorizationError = createError(EError.Authorization, 'Необходима авторизация');
export const BadParametersError = createError(EError.BadParameters, 'Плохие параметры');
export const ParametersExpiredError = createError(EError.ParametersExpired, 'Время действия параметров запуска истекло');
export const NotFoundError = createError(EError.NotFound, 'Не найдено');
export const UnknownError = createError(EError.Unknown, 'Произошла неизвестная ошибка');
