/* eslint-disable */
'use strict';

var gulp = require('gulp'),
    mocha = require('gulp-mocha'),
    eslint = require('gulp-eslint');

var paths = {
    scripts: ['./*.js', '!./gulpfile.js']
};

gulp.task('lint', function () {
    return gulp.src(paths.scripts)
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('test', function () {
    return gulp.src('./test/*.js')
        .pipe(mocha({ reporter: 'spec' }));
});

gulp.task('watch', function () {
    gulp.watch(paths.scripts, ['lint', 'test']);
});

gulp.task('default', ['lint', 'test', 'watch']);
