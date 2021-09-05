import {createServer, Server} from 'http';
import express, {Express} from 'express';
import cors from 'cors';
import {Container} from 'typedi';
import {ConfigToken} from '~/shared/di';
import {
  createAdminApolloServer,
  createPublicApolloServer,
} from '~/api/gql';
import {registerEnums} from '~/api/gql/utils';
import {ApolloServer} from 'apollo-server-express';
import {isString} from '~/shared/utils';
import {
  defaultErrorHandler,
  launchParamsHandler,
  sentryEntryHandler, sentryFlushHandler,
} from '~/api/http/handlers';

/**
 * Возвращает middleware для сервера apollo.
 * @param server
 */
function getServerMiddleware(server: ApolloServer) {
  return server.getMiddleware({path: '/', cors: false});
}

/**
 * Устанавливает хэндлеры создания подписки если в этом есть необходимость.
 * @param apolloServer
 * @param httpServer
 */
function installSubscriptionHandlers(
  apolloServer: ApolloServer,
  httpServer: Server,
) {
  if (isString(apolloServer.subscriptionsPath)) {
    apolloServer.installSubscriptionHandlers(httpServer);
  }
}

/**
 * Привязывает к express-серверу сервер Apollo с минимальным набором
 * хэндлеров.
 * @param app
 * @param endpoint
 * @param server
 */
function useApolloHandlers(
  app: Express,
  endpoint: string,
  server: ApolloServer,
) {
  const middleware = getServerMiddleware(server);

  // POST-запросы используются для выполнения всех операций сервера.
  app.post(
    endpoint, launchParamsHandler, sentryEntryHandler, middleware,
    sentryFlushHandler
  );

  // GET-запросы используются для получения Playground. Его ПО обрабатывает
  // самостоятельно.
  app.get(endpoint, middleware);
}

/**
 * Запускает HTTP-сервер.
 */
export async function startHttpServer() {
  const {
    port, gqlAdminHttpEndpoint, gqlPublicHttpEndpoint, enableCors,
  } = Container.get(ConfigToken);
  const app = express();
  const server = createServer(app);

  // Перед созданием серверов Apollo, регистрируем необходимые енумы.
  registerEnums();

  // Создаем ручки для публичного и админского доступа.
  const [admServer, publicServer] = await Promise.all([
    createAdminApolloServer(),
    createPublicApolloServer(),
  ]);

  // Создаем хэндлеры для подписок.
  installSubscriptionHandlers(publicServer, server);
  installSubscriptionHandlers(admServer, server);

  if (enableCors) {
    app.use(cors());
  }
  app.use(express.json());
  app.use(express.urlencoded({extended: false}));
  app.use(defaultErrorHandler);

  // Создаем хэндлеры для ручек.
  useApolloHandlers(app, gqlPublicHttpEndpoint, publicServer);
  useApolloHandlers(app, gqlAdminHttpEndpoint, admServer);

  return server.listen(port, () => {
    console.log(`Public: http://localhost:${port}${gqlPublicHttpEndpoint}`);
    console.log(`Admin: http://localhost:${port}${gqlAdminHttpEndpoint}`);
  });
}
