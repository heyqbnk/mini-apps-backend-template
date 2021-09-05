import {Args, ArgsType, Field, Int, Maybe, ObjectType} from 'type-graphql';
import {Inject} from 'typedi';
import {UsersService} from '~/shared/services';
import {User} from '~/api/gql/structures';

@ArgsType()
class UserIdArgs {
  @Field(() => Int, {
    description: 'Идентификатор пользователя ВКонтакте',
  })
  vkUserId: number;
}

@ObjectType()
export class UserQueries {
  @Inject(() => UsersService)
  private readonly service: UsersService;

  @Field(() => [User], {
    description: 'Возвращает список всех администраторов проекта',
  })
  admins(): Promise<User[]> {
    return this
      .service
      .findAdmins()
      .then(users => users.map(u => new User(u)));
  }

  @Field(() => User, {
    description: 'Возвращает информацию о пользователе по его идентификатору',
    nullable: true,
  })
  byId(
    @Args(() => UserIdArgs) {vkUserId}: UserIdArgs
  ): Promise<Maybe<User>> {
    return this
      .service
      .findById(vkUserId)
      .then(user => user === null ? null : new User(user));
  }
  
  @Field(() => Boolean, {
    description: 'Возвращает true, в случае если пользователь является ' +
      'администратором'
  })
  isAdmin(
    @Args(() => UserIdArgs) {vkUserId}: UserIdArgs
  ): Promise<boolean> {
    return this.service.isAdmin(vkUserId);
  }
}
