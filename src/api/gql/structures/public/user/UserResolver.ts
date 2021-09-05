import {Query, Resolver} from 'type-graphql';
import {UserQueries} from '~/api/gql/structures/public/user/UserQueries';
import {Container} from 'typedi';

@Resolver()
export class UserResolver {
  @Query(() => UserQueries, {
    description: 'Запросы, связанные с пользователями'
  })
  user(): UserQueries {
    // Создаем экземпляр UserQueries через Container.get чтобы внедрить в него
    // зависимости. В противном случае, будет создан экземпляр без зависимостей
    // и посыпятся ошибки при обращении к undefined полям.
    return Container.get(UserQueries);
  }
}