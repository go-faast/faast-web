const gulp = require('gulp')
const path = require('path')
const fs = require('fs')
const gulpClean = require('gulp-clean')
const run = require('gulp-run-command').default
const testcafe = require('gulp-testcafe')

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

gulp.task('test:e2e', () =>
  gulp.src(path.join(dirs.testE2e, 'test.js'))
    .pipe(testcafe({
      // https://github.com/DevExpress/gulp-testcafe/blob/master/index.js
      app: 'npm run start',
      browsers: ['firefox'],
      reporter: [
        {
          name: 'spec'
        },
        {
          name: 'xunit',
          output: fs.createWriteStream(path.join(dirs.testE2eReports, 'report.xml'))
        }
      ]
    })))

gulp.task('compile:app', run('webpack --config etc/webpack.config.app.js'))
gulp.task('compile:widget', run('webpack --config etc/webpack.config.widget.js'))
gulp.task('compile:site', run('node --max_old_space_size=8192 ./node_modules/react-static/bin/react-static-build'))

gulp.task('combine:app', () => mergeDist(path.join(dirs.buildApp, '**/*')))
gulp.task('combine:widget', () => mergeDist(path.join(dirs.buildWidget, '**/*')))
gulp.task('combine:site', () => mergeDist(path.join(dirs.buildSite, '**/*')))

gulp.task('build:app', gulp.series('compile:app', 'combine:app'))
gulp.task('build:widget', gulp.series('compile:widget', 'combine:widget'))
gulp.task('build:site', gulp.series('compile:site', 'combine:site'))
gulp.task('build:lambda', run('netlify-lambda build src/lambda'))

gulp.task('prebuild', gulp.series('clean'))

const build = gulp.series('prebuild', gulp.parallel(['build:widget', 'build:site', 'build:lambda']))

gulp.task('build', build)

gulp.task('default', build)
