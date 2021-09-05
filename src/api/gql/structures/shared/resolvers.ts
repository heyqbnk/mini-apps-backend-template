import {NonEmptyArray} from 'type-graphql';
import {UserFieldsResolver} from '~/api/gql/structures/shared';

/**
 * Возвращает резолверы, которые могут использоваться в админской, так и
 * в публичной ручках.
 */
export function getSharedResolvers(): NonEmptyArray<any> {
  return [UserFieldsResolver];
}