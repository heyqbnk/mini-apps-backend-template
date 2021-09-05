import {NonEmptyArray} from 'type-graphql';
import {UserResolver} from '~/api/gql/structures/public/user';

/**
 * Возвращает резолверы, которые могут использоваться в публичной ручке.
 */
export function getPublicResolvers(): NonEmptyArray<any> {
  return [UserResolver];
}