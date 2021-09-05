import {
  FieldResolver,
  Int,
  Resolver,
  Root,
} from 'type-graphql';
import {User} from '~/api/gql/structures/shared/user/User';

const MILLISECONDS_IN_YEAR = 365 * 24 * 60 * 60 * 1000;

@Resolver(() => User)
export class UserFieldsResolver {
  @FieldResolver(() => Int, {
    description: 'Полное количество лет пользователя'
  })
  age(@Root() user: User): number {
    const diff = Date.now() - user.birthDate.getTime();

    return Math.floor(diff / MILLISECONDS_IN_YEAR);
  }
}
