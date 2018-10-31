/* eslint-disable */
'use strict';

var gulp = require('gulp'),
    mocha = require('gulp-mocha'),
    eslint = require('gulp-eslint'),
    paths = {
        scripts: ['./*.js', './lib/*.js', '!./gulpfile.js']
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
    gulp.watch(paths.scripts, gulp.parallel('lint', 'test'));
});

gulp.task('default', gulp.parallel('lint', 'test', 'watch'));
