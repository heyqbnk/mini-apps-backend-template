import {parse} from 'querystring';
import {ContextFunction} from 'apollo-server-core';
import {
  ApolloServer,
  ExpressContext,
} from 'apollo-server-express/dist/ApolloServer';
import {IContext} from '~/api/gql/types';
import {IAuthorizedLocals, isAuthorizedLocals} from '~/api/shared';
import {ExecutionParams} from 'subscriptions-transport-ws';
import {AuthChecker, buildSchema, BuildSchemaOptions} from 'type-graphql';
import {Container} from 'typedi';
import {PubSub} from '~/shared/lib';
import {isRecord, isString, verifyLaunchParams} from '~/shared/utils';
import {GraphQLError, GraphQLFormattedError} from 'graphql';
import {AuthorizationError, EError} from '~/shared/errors';
import {ConfigToken} from '~/shared/di';
import {UsersService} from '~/shared/services';
import {SentryMiddleware} from '~/api/gql/middlewares';

/**
 * Ошибка, отформатированная перед выбросом во внешнюю среду.
 */
interface IFormattedError extends GraphQLFormattedError {
  name: string;
}

interface ICreateApolloServerOptions extends BuildSchemaOptions {
  subscriptionsPath?: string
}

/**
 * Регистрирует все необходимые enum-ы.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-function
export function registerEnums() {

}

/**
 * Создает контекст в ApolloServer.
 * @param expressContext
 */
const context: ContextFunction<ExpressContext, IContext> = expressContext => {
  const {res, connection: _connection} = expressContext;
  const connection = _connection as ExecutionParams<ReturnType<typeof onConnect>>;

  if (connection === undefined) {
    if (!isAuthorizedLocals(res.locals)) {
      throw new AuthorizationError('Параметры запуска не найдены');
    }
    return res.locals;
  }
  return connection.context;
};

/**
 * Форматирует ошибку возникшую в резолвере перед выводом ее во внешнюю среду.
 * В зависимости от среды, скрывает или отображает сервисные поля.
 * @param error
 */
function formatError(error: GraphQLError): IFormattedError {
  const {name, extensions = {}, path, message} = error;
  const contextCreationFailedText = 'Context creation failed: ';

  // Ошибка создания контекста.
  if (message.startsWith(contextCreationFailedText)) {
    return {
      name,
      message: message.slice(
        message.indexOf(contextCreationFailedText) +
        contextCreationFailedText.length,
      ),
      path,
    };
  }
  // Ошибка выброшенная в декораторе Authorized от type-graphql.
  else if (message.startsWith('Access denied!')) {
    return {name: EError.Forbidden, message, path};
  }
  // Если ошибка валидации через class-validator.
  else if (isRecord(extensions.exception) && 'validationErrors' in extensions.exception) {
    return {
      name: EError.Validation,
      message,
      path,
      extensions: {
        exception: extensions.exception.validationErrors,
      },
    };
  }
    // Если ошибка в операции (попытка выбрать поле, которого не существует,
  // или передать неподходящий тип и так далее).
  else if (name === 'ValidationError') {
    return {name: EError.Schema, message, path};
  }
  // Общая ошибка, которую мы выбрасываем в каком-либо резолвере.
  else if (name === 'GraphQLError') {
    return {
      name: extensions?.exception?.name || EError.Unknown,
      message,
      path,
    };
  }
  // Неизвестная ошибка. Просто очищаем приватные данные.
  return {name, path, message};
}

/**
 * При подключении к сокету создает контекст, который далее используется
 * сервером Apollo при создании собственного контекста.
 * @param connectionParams
 */
function onConnect(connectionParams: Record<any, any>): IAuthorizedLocals {
  const launchParamsStr = connectionParams['x-launch-params'] || '';

  return {
    launchParams: verifyLaunchParams(launchParamsStr),
    launchParamsQuery: parse(launchParamsStr),
  };
}

/**
 * Функция, которая проверяет, имеется ли у текущего клиента доступ к получению
 * поля, для которого требуется авторизация.
 * @param resolverData
 */
const authChecker: AuthChecker<IContext, any> = resolverData => {
  const {context: {launchParams: {userId}}} = resolverData;

  return Container.get(UsersService).isAdmin(userId);
}

/**
 * Создает сервер Apollo с переданными резолверами.
 * @param options
 */
export async function createApolloServer(
  options: ICreateApolloServerOptions,
): Promise<ApolloServer> {
  const {appEnv} = Container.get(ConfigToken);
  const {subscriptionsPath, globalMiddlewares = [], ...rest} = options;
  const schema = await buildSchema({
    ...rest,
    authChecker,
    container: Container,
    pubSub: isString(subscriptionsPath) ? Container.get(PubSub) : undefined,
    globalMiddlewares: [SentryMiddleware, ...globalMiddlewares],
  });
  const isLocal = appEnv === 'local';

  return new ApolloServer({
    schema,
    context,
    subscriptions: isString(subscriptionsPath) ? {
      path: subscriptionsPath,
      onConnect,
    } : false,
    formatError,
    // Playground и информацию о схеме мы открываем только в локальном
    // окружении.
    introspection: isLocal,
    playground: isLocal,
  });
}
