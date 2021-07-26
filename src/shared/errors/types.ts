/**
 * Список ошибок, которые сервер может вернуть.
 */
export enum EError {
  Authorization = 'AuthorizationError',
  BadParameters = 'BadParametersError',
  Forbidden = 'ForbiddenError',
  ParametersExpired = 'ParametersExpiredError',
  Schema = 'SchemaError',
  NotFound = 'NotFoundError',
  Unknown = 'UnknownError',
  Validation = 'ValidationError',
}
