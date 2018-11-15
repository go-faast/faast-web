const gulp = require('gulp')
const path = require('path')
const clean = require('gulp-clean')

const { dirs } = require('./etc/common.js')
 
gulp.task('dist-clean', () =>
  gulp.src(dirs.dist, { read: false })
    .pipe(clean()))

gulp.task('dist', ['dist-clean'], () =>
  gulp.src([
    path.join(dirs.buildSite, '**/*'),
    path.join(dirs.buildApp, '**/*'),
  ]).pipe(gulp.dest(dirs.dist)))
