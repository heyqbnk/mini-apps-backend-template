import {createServer, Server as HttpServer} from 'http';
import express, {Express} from 'express';
import cors from 'cors';
import {Container} from 'typedi';
import {ConfigToken} from '~/shared/di';
import {createAdminApolloServer, createPublicApolloServer} from '~/api/gql';
import {registerEnums} from '~/api/gql/utils';
import {ApolloServer} from 'apollo-server-express';
import {isString} from '~/shared/utils';
import {
  defaultErrorHandler,
  launchParamsHandler,
  sentryHandler,
} from '~/api/http/handlers';
import {Handlers} from '@sentry/node';

/**
 * Привязывает к express-серверу сервер Apollo с минимальным набором
 * хэндлеров.
 * @param app
 * @param endpoint
 * @param apolloServer
 * @param httpServer
 */
function useEndpointHandler(
  endpoint: string,
  app: Express,
  apolloServer: ApolloServer,
  httpServer: HttpServer,
) {
  const middleware = apolloServer.getMiddleware({path: '/', cors: false});

  // POST-запросы используются для выполнения всех операций сервера.
  app.post(endpoint, launchParamsHandler, sentryHandler, middleware);

  // GET-запросы используются для получения Playground. Его ПО от Apollo
  // обрабатывает самостоятельно.
  app.get(endpoint, middleware);

  // В случае, если указан путь для создания подписок, устанавливаем
  // специальные хэндлеры.
  if (isString(apolloServer.subscriptionsPath)) {
    apolloServer.installSubscriptionHandlers(httpServer);
  }
}

/**
 * Запускает HTTP-сервер.
 */
export async function startHttpServer() {
  const {
    port, gqlAdminHttpEndpoint, gqlPublicHttpEndpoint, enableCors,
  } = Container.get(ConfigToken);
  const app = express();
  const httpServer = createServer(app);

  // Перед созданием серверов Apollo, регистрируем необходимые енумы.
  registerEnums();

  // Создаем ручки для публичного и админского доступа.
  const [admServer, publicServer] = await Promise.all([
    createAdminApolloServer(),
    createPublicApolloServer(),
  ]);

  // Добавляем хэндлер от Sentry, чтобы для каждого запроса выделялся отдельный
  // скоуп.
  app.use(Handlers.requestHandler());

  if (enableCors) {
    app.use(cors());
  }
  app.use(express.json());
  app.use(express.urlencoded({extended: false}));
  app.use(defaultErrorHandler);

  // Создаем хэндлеры для ручек.
  useEndpointHandler(gqlPublicHttpEndpoint, app, publicServer, httpServer);
  useEndpointHandler(gqlAdminHttpEndpoint, app, admServer, httpServer);

  return httpServer.listen(port, () => {
    console.log(`Public: http://localhost:${port}${gqlPublicHttpEndpoint}`);
    console.log(`Admin: http://localhost:${port}${gqlAdminHttpEndpoint}`);
  });
}
