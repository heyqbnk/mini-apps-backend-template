import {IAuthorizedLocals} from '~/api/shared';

/**
 * Контекст, который передается в резолверы GraphQL.
 */
export interface IContext extends IAuthorizedLocals {
}