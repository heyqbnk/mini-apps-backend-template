import {createParamDecorator} from 'type-graphql';
import {IVerifiedLaunchParams} from '~/shared/utils';
import {IContext} from '~/api/gql/types';

/**
 * Возвращает параметры запуска.
 * @constructor
 */
export function UseLaunchParams() {
  return createParamDecorator<IContext>(({context}) => {
    return context.launchParams;
  });
}

export {IVerifiedLaunchParams as LaunchParams};
