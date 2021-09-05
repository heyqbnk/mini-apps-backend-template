import {Args, ArgsType, Field, Int, Maybe, ObjectType} from 'type-graphql';
import {User} from '~/api/gql/structures';
import {Inject} from 'typedi';
import {UsersService} from '~/shared/services';

@ArgsType()
class UpdateByIdArgs {
  @Field(() => Int, {description: 'Идентификатор пользователя'})
  vkUserId: number

  @Field(() => String, {
    description: 'Имя пользователя',
    nullable: true,
  })
  firstName: Maybe<string>;

  @Field(() => String, {
    description: 'Фамилия пользователя',
    nullable: true,
  })
  lastName: Maybe<string>;

  @Field(() => Date, {
    description: 'Дата рождения пользователя',
    nullable: true,
  })
  birthDate: Maybe<Date>;
}

@ArgsType()
class SetRoleArgs {
  @Field(() => Int, {
    description: 'Идентификатор пользователя ВКонтакте'
  })
  vkUserId: number;

  @Field(() => Boolean, {
    description: 'Должен ли пользователь стать администратором'
  })
  isAdmin: boolean;
}

@ObjectType()
export class UserMutations {
  @Inject(() => UsersService)
  private readonly service: UsersService;

  @Field(() => User, {
    description: 'Изменяет роль пользователя в приложении'
  })
  async setRole(
    @Args(() => SetRoleArgs) {vkUserId, isAdmin}: SetRoleArgs
  ): Promise<User> {
    return this.service.setRole(vkUserId, isAdmin).then(user => new User(user));
  }

  @Field(() => User, {
    description: 'Обновляет пользователя по его идентификатору'
  })
  async updateById(
    @Args(() => UpdateByIdArgs) args: UpdateByIdArgs
  ): Promise<User> {
    const {vkUserId, firstName, birthDate, lastName} = args;
    const user = await this.service.updateById(vkUserId, {
      firstName: firstName || undefined,
      birthDate: birthDate || undefined,
      lastName: lastName || undefined
    });

    return new User(user);
  }
}
