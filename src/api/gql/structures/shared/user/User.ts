import {Field, Int, ObjectType} from 'type-graphql';

interface IConProps {
  vkUserId: number;
  firstName: string;
  lastName: string;
  birthDate: Date;
}

@ObjectType({description: 'Пользователь приложения'})
export class User {
  constructor(props: IConProps) {
    const {vkUserId, firstName, lastName, birthDate} = props;
    this.vkUserId = vkUserId;
    this.firstName = firstName;
    this.lastName = lastName;
    this.birthDate = birthDate;
  }

  private readonly firstName: string;
  private readonly lastName: string;
  readonly birthDate: Date;

  @Field(() => Int, {
    description: 'Уникальный идентификатор пользователя ВКонтакте',
  })
  vkUserId: number;

  @Field(() => String, {
    description: 'Полное имя пользователя',
  })
  name(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
