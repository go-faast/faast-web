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
  gulp.src(dirs.dist, { read: false, allowEmpty: true })
    .pipe(gulpClean()))

gulp.task('lint:js', run('npm run lint:js'))
gulp.task('lint:ts', run('npm run lint:ts'))
gulp.task('lint', gulp.parallel(['lint:js', 'lint:ts']))

gulp.task('compile:app', run('webpack --config etc/webpack.config.app.js'))
gulp.task('compile:site', run('react-static build'))
gulp.task('compile-staging:site', run('react-static build --staging'))

gulp.task('combine:app', () => mergeDist(path.join(dirs.buildApp, '**/*')))
gulp.task('combine:site', () => mergeDist(path.join(dirs.buildSite, '**/*')))

gulp.task('build:app', gulp.series('compile:app', 'combine:app'))
gulp.task('build:site', gulp.series('compile:site', 'combine:site'))
gulp.task('build-staging:site', gulp.series('compile-staging:site', 'combine:site'))

gulp.task('prebuild', gulp.series('lint', 'clean'))

const build = gulp.series('prebuild', gulp.parallel(['build:app', 'build:site']))
const buildStaging = gulp.series('prebuild', gulp.parallel(['build:app', 'build-staging:site']))

gulp.task('build', build)
gulp.task('build-staging', buildStaging)

gulp.task('default', build)
