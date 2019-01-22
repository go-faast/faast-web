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

gulp.task('combine:app', () => mergeDist(path.join(dirs.buildApp, '**/*')))
gulp.task('combine:site', () => mergeDist(path.join(dirs.buildSite, '**/*')))

gulp.task('build:app', gulp.series('compile:app', 'combine:app'))
gulp.task('build:site', gulp.series('compile:site', 'combine:site'))
gulp.task('build:lambda', run('netlify-lambda build src/lambda'))

gulp.task('prebuild', gulp.series('clean'))

const build = gulp.series('prebuild', gulp.parallel(['build:app', 'build:site', 'build:lambda']))

gulp.task('build', build)

gulp.task('default', build)
