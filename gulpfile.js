const gulp = require('gulp')
const path = require('path')
const gulpClean = require('gulp-clean')
const run = require('gulp-run-command').default

const { dirs } = require('./etc/common.js')

const ignoredFiles = [
  '!' + path.join(dirs.buildSite, '**/_*'), // exclude folders starting with '_'
  '!' + path.join(dirs.buildSite, '**/_*/**/*'), // exclude files/subfolders in folders starting with '_'
]

const mergeDist = (path) =>
  gulp.src([
    path,
    ...ignoredFiles,
  ]).pipe(gulp.dest(dirs.dist, { overwrite: false }))

gulp.task('clean', () =>
  gulp.src(dirs.dist, { read: false })
    .pipe(gulpClean()))

gulp.task('lint:js', run('npm run lint:js'))
gulp.task('lint:ts', run('npm run lint:ts'))
gulp.task('lint', gulp.parallel(['lint:js', 'lint:ts']))

gulp.task('compile:app', run('npm run compile:app'))
gulp.task('compile:site', run('npm run compile:site'))
gulp.task('compile-staging:app', run('npm run compile:app'))
gulp.task('compile-staging:site', run('npm run compile-staging:site'))

gulp.task('combine:app', () => mergeDist(path.join(dirs.buildApp, '**/*')))
gulp.task('combine:site', () => mergeDist(path.join(dirs.buildSite, '**/*')))

gulp.task('dist:app', gulp.series('compile:app', 'combine:app'))
gulp.task('dist:site', gulp.series('compile:site', 'combine:site'))
gulp.task('dist-staging:app', gulp.series('compile-staging:app', 'combine:app'))
gulp.task('dist-staging:site', gulp.series('compile-staging:site', 'combine:site'))

const dist = gulp.series('lint', 'clean', gulp.parallel(['dist:app', 'dist:site']))

gulp.task('dist', dist)
gulp.task('default', dist)
