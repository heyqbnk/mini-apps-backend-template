import {Field, Maybe, ObjectType} from 'type-graphql';
import {User} from '~/api/gql/structures';
import {Inject} from 'typedi';
import {UsersService} from '~/shared/services';
import {UseLaunchParams, LaunchParams} from '~/api/gql/decorators';
import {NotFoundError} from '~/shared/errors';

@ObjectType({
  description: 'Запросы, связанные с пользователем'
})
export class UserQueries {
  @Inject(() => UsersService)
  private readonly service: UsersService;

  @Field(() => User, {
    description: 'Возвращает текущего пользователя',
    nullable: true,
  })
  current(@UseLaunchParams() {userId}: LaunchParams): Promise<Maybe<User>> {
    throw new NotFoundError('Yep');
    return this
      .service
      .findById(userId)
      .then(user => user === null ? null : new User(user));
  }
}
