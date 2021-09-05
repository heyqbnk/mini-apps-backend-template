import {Authorized, Mutation, Query, Resolver} from 'type-graphql';
import {UserMutations} from '~/api/gql/structures/admin/user/UserMutations';
import {Container} from 'typedi';
import {UserQueries} from '~/api/gql/structures/admin/user/UserQueries';

@Resolver()
export class UserResolver {
  @Authorized()
  @Mutation(() => UserMutations, {name: 'user'})
  userMutations(): UserMutations {
    return Container.get(UserMutations);
  }

  @Authorized()
  @Query(() => UserQueries, {name: 'user'})
  userQueries(): UserQueries {
    return Container.get(UserQueries);
  }
}