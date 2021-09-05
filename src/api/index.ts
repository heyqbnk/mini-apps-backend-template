import '~/shared/utils/inject-globals';
import * as os from 'os';
import * as Sentry from '@sentry/node';
import {ConfigToken, injectDependencies} from '~/shared/di';
import {Container} from 'typedi';
import {startHttpServer} from '~/api/http';
import {fork, isMaster, Worker} from 'cluster';
import {VKAPIProvider} from 'vkontakte-api/dist/multithreading';
import {PubSubProvider} from '~/shared/lib';
import {getSecuredConfig} from '~/shared/config';
import {fatalErrorCatcher} from '~/shared/utils';

/**
 * Инициализирует проект в режиме разработки.
 */
export async function initSingleThread() {
  console.log('Config:', getSecuredConfig());

  // Запускаем HTTP-сервер.
  return startHttpServer();
}

/**
 * Инициализирует проект в production режиме.
 */
export async function initMultiThread() {
  if (isMaster) {
    const config = Container.get(ConfigToken);
    console.log('Config:', getSecuredConfig());

    // Количество потоков ограничиваем текущим значением в конфиге, либо
    // максимальным доступным количеством.
    const threadsCount = Math.min(os.cpus().length, config.maxThreadsCount);
    const workers: Worker[] = [];

    for (let i = 0; i < threadsCount; i++) {
      workers.push(fork());
    }

    // Создаем провайдер VKAPI для переданных потоков, чтобы из них мы могли
    // использовать API ВКонтакте и сразу запускаем его.
    new VKAPIProvider({workers, rps: config.vkAppApiRps}).init();
    new PubSubProvider().init();
  } else {
    await startHttpServer();
  }
}

/**
 * Производит запуск проекта.
 */
export async function init() {
  const config = Container.get(ConfigToken);

  if (config.maxThreadsCount > 1) {
    return initMultiThread();
  }
  return initSingleThread();
}

// Внедряем зависимости.
injectDependencies();

// Запускаем сервер.
init().catch(e => {
  // Логируем фатальную ошибку в Sentry.
  fatalErrorCatcher(e);

  // Через 2 секунды убиваем процесс.
  Sentry.close(2000).then(() => process.exit(1));
});