import {NonEmptyArray} from 'type-graphql';
import {UserResolver} from '~/api/gql/structures/admin/user';

/**
 * Возвращает резолверы, которые могут использоваться в админской ручке.
 */
export function getAdminResolvers(): NonEmptyArray<any> {
  return [UserResolver];
}