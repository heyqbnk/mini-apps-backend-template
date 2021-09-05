/* eslint-disable @typescript-eslint/no-var-requires */
const {src, dest, series} = require('gulp');
const clean = require('gulp-clean');
const sourceMaps = require('gulp-sourcemaps');
const tsLoader = require('gulp-typescript');
const path = require('path');

/**
 * Компилирует TypeScript в JavaScript.
 * @return {*}
 */
function compileTypeScript() {
  // Создаем компилятор TypeScript.
  const tsProject = tsLoader.createProject('../tsconfig.json', {
    rootDir: path.resolve(__dirname, '..'),
  });

  // Компилируем TS.
  return src('../src/**/*.ts', {base: '../src'})
    .pipe(sourceMaps.init())
    .pipe(tsProject())
    .pipe(sourceMaps.mapSources(sourcePath => sourcePath.replace('../../src', 'dist')))
    .pipe(sourceMaps.write('.', {includeContent: true, sourceRoot: '/'}))
    .pipe(dest('../build/dist'));
}

/**
 * Удаляет билд директорию.
 * @returns {null|*}
 */
function removeBuild() {
  return src('../build', {allowEmpty: true}).pipe(clean({force: true}));
}

/**
 * Копирует необходимые для жизни проекта файлы.
 */
function copyFiles() {
  const files = ['../package.json', '../.env'];

  for (const file of files) {
    src(file).pipe(dest('../build'));
  }
  return src('../static/**/*').pipe(dest('../build/static'));
}

exports.default = series(removeBuild, copyFiles, compileTypeScript);
