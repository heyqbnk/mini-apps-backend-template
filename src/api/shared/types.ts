import {IVerifiedLaunchParams} from '~/shared/utils';
import {ParsedUrlQuery} from 'querystring';
import {Transaction} from '@sentry/types';

export interface IAuthorizedLocals {
  /**
   * Верифицированные параметры запуска.
   */
  launchParams: IVerifiedLaunchParams;
  /**
   * Параметры запуска в виде Query.
   */
  launchParamsQuery: ParsedUrlQuery;
}

export interface ISentryFilledLocals {
  /**
   * Транзакция сентри.
   */
  transaction: Transaction;
}