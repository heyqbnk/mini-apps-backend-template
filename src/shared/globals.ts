import 'reflect-metadata';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import utc from 'dayjs/plugin/utc';
import {useContainer} from 'class-validator';
import {Container} from 'typedi';
import * as Sentry from '@sentry/node';
import {RewriteFrames} from '@sentry/integrations';
import {config} from '~/shared/config';
import path from 'path';

// Инициализируем sentry.
if (config.sentryDsn !== null) {
  const {sentryDsn, appEnv, release, appId} = config;

  Sentry.init({
    attachStacktrace: true,
    dsn: sentryDsn,
    maxBreadcrumbs: 30,
    maxValueLength: 10000,
    normalizeDepth: 6,
    environment: appEnv,
    release,
    tracesSampleRate: 1,
    shutdownTimeout: 1000,
    integrations: [new RewriteFrames({
      // В продакшене нам необходимо смотреть в директорию dist.
      root: path.resolve(__dirname, '../..')
    })],
  });
  Sentry.setTag('Node Version', process.version);
  Sentry.setTag('Application ID', appId);
}

// Заменяем контейнер в class-validator.
useContainer(Container);

// Расширяем dayjs плагинами, которые могут нам пригодиться, чтобы не делать
// это в каждом файле.
dayjs.extend(utc);
dayjs.extend(customParseFormat);
