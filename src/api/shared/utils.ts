import {IAuthorizedLocals, ISentryFilledLocals} from '~/api/shared/types';

/**
 * Утверждает, что переданное значение содержит информацию о параметрах
 * запуска.
 * @param value
 */
export function isAuthorizedLocals(
  value: Record<string, any>,
): value is IAuthorizedLocals {
  return 'launchParams' in value && 'launchParamsQuery' in value;
}

/**
 * Утверждает, что переданное значение содержит информацию, которую вносит
 * обработчик Sentry.
 * @param value
 */
export function isSentryFilledLocals(
  value: Record<string, any>,
): value is ISentryFilledLocals {
  return 'transaction' in value;
}