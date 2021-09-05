/* eslint-disable @typescript-eslint/no-var-requires */
const {default: buildProject} = require('./build');
const {series} = require('gulp');
const Sentry = require('@sentry/cli');
const dotenv = require('dotenv');
const packageJson = require('../package.json');
const path = require('path');

async function deploySourceMaps(done) {
  // Заносим переменные окружения.
  dotenv.config({path: path.resolve(__dirname, '../.env')});

  const appEnv = process.env.APP_ENV;
  const authToken = process.env.SENTRY_DEPLOY_TOKEN;

  if (typeof appEnv !== 'string') {
    throw new Error('Невозможно выгрузить артефакты из-за отсутствия APP_ENV');
  }
  if (appEnv === 'local') {
    console.log('Артефакты не выгружены ввиду того что APP_ENV = local');
    return;
  }
  if (typeof authToken !== 'string') {
    throw new Error('Невозможно выгрузить артефакты из-за отсутствия SENTRY_DEPLOY_TOKEN');
  }
  const cli = new Sentry('../.sentryclirc', {silent: true, authToken});
  const release = packageJson.version + '-' + appEnv;

  // Загружаем сурс-мапы.
  await cli
    .execute(['releases', 'files', release, 'upload-sourcemaps', '../build'], false);

  console.log('Сурс-мапы выгружены. Релиз:', release);
  done();
}

exports.default = series(buildProject, deploySourceMaps);