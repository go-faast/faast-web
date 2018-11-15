const gulp = require('gulp')
const path = require('path')
const clean = require('gulp-clean')
const run = require('gulp-run-command').default
const sequence = require('run-sequence')

const { dirs } = require('./etc/common.js')

const series = (...args) => (cb) => sequence(...args, cb)

gulp.task('lint:js', run('eslint src/'))
gulp.task('lint:ts', run('tslint -p .'))
gulp.task('lint', ['lint:js', 'lint:ts'])

gulp.task('compile:app', run('webpack --config etc/webpack.config.app.js --progress'))
gulp.task('compile:site', run('react-static build'))

gulp.task('clean', () =>
  gulp.src(dirs.dist, { read: false })
    .pipe(clean()))

gulp.task('dist:app', () =>
  gulp.src(path.join(dirs.buildSite, '**/*'))
    .pipe(gulp.dest(dirs.dist)))

gulp.task('dist:site', () =>
  gulp.src(path.join(dirs.buildSite, '**/*'))
    .pipe(gulp.dest(dirs.dist)))

gulp.task('build:app', series('compile:app', 'dist:app'))
gulp.task('build:site', series('compile:site', 'dist:site'))
gulp.task('build', series('lint', 'clean', ['build:app', 'build:site']))

gulp.task('default', ['build'])
