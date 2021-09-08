import {IVerifiedLaunchParams} from '~/shared/utils';
import {ParsedUrlQuery} from 'querystring';

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
