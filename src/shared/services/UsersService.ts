import {Service} from 'typedi';
import {BadParametersError, NotFoundError} from '~/shared/errors';

/**
 * Пользователь приложения.
 */
interface IUser {
  /**
   * Уникальный идентификатор ВКонтакте.
   */
  vkUserId: number;
  /**
   * Имя.
   */
  firstName: string;
  /**
   * Фамилия.
   */
  lastName: string;
  /**
   * Дата рождения.
   */
  birthDate: Date;
  /**
   * Является ли пользователь администратором приложения.
   */
  isAdmin?: boolean;
}

/**
 * Сервис, основная задача которого - взаимодействие с пользователям. В этом
 * сервисе может происходить получение и изменение информации о пользователе.
 * В продуктовых проектах здесь необходимо подключать клиент БД, который
 * является связующим звеном между сервером и самой базой данных.
 *
 * В этом примере мы ограничимся локальным массивом.
 */
@Service()
export class UsersService {
  private readonly users: IUser[] = [{
    vkUserId: 4,
    firstName: 'Павел',
    lastName: 'Дуров',
    birthDate: new Date('1980-07-30T00:00:00.000Z'),
    isAdmin: true,
  }, {
    vkUserId: 10,
    firstName: 'Николай',
    lastName: 'Дуров',
    birthDate: new Date('1975-02-22T00:00:00.000Z'),
  }, {
    vkUserId: 1233,
    firstName: 'Андрей',
    lastName: 'Рогозов',
    birthDate: new Date('1990-01-15T00:00:00.000Z'),
  }];

  /**
   * Создает пользователя и возвращает его.
   * @param user
   */
  async create(user: IUser): Promise<IUser> {
    const existingUser = await this.findById(user.vkUserId);

    if (existingUser !== null) {
      throw new BadParametersError('Пользователь уже существует');
    }
    this.users.push(user);

    return user;
  }

  /**
   * Возвращает пользователя по его идентификатору.
   * @param vkUserId
   */
  async findById(vkUserId: number): Promise<IUser | null> {
    return this.users.find(u => u.vkUserId === vkUserId) || null;
  }

  /**
   * Возвращает всех администраторов приложения.
   */
  async findAdmins(): Promise<IUser[]> {
    return this.users.filter(u => u.isAdmin);
  }

  /**
   * Возвращает true если пользователь с таким идентификатором является
   * администратором приложения.
   * @param vkUserId
   */
  async isAdmin(vkUserId: number): Promise<boolean> {
    const user = await this.findById(vkUserId);

    return user === null ? false : user.isAdmin === true;
  }

  /**
   * Обновляет роль пользователя в приложении.
   * @param vkUserId
   * @param isAdmin
   */
  async setRole(vkUserId: number, isAdmin: boolean): Promise<IUser> {
    const user = await this.findById(vkUserId);

    if (user === null) {
      throw new NotFoundError('Пользователь не найден');
    }
    user.isAdmin = isAdmin;

    return user;
  }

  /**
   * Обновляет информацию о пользователе при помощи его идентификатора.
   * @param vkUserId
   * @param data
   */
  async updateById(
    vkUserId: number,
    data: Partial<Omit<IUser, 'vkUserId'>>,
  ): Promise<IUser> {
    const user = await this.findById(vkUserId);

    if (user === null) {
      throw new NotFoundError('Пользователь не найден');
    }
    // NOTE: Такой подход не очень хорош. Лучше написать функцию, которая
    // удалит все undefined поля. Они нам не нужны ввиду того, что перетрут
    // поля.
    const {
      birthDate = user.birthDate,
      firstName = user.firstName,
      lastName = user.lastName,
    } = data;
    user.birthDate = birthDate;
    user.firstName = firstName;
    user.lastName = lastName;

    return user;
  }
}