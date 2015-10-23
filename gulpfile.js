'use strict';

var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    mocha = require('gulp-mocha'),
    jscs = require('gulp-jscs');

var paths = {
    scripts: ['./*.js', '!./gulpfile.js']
};

gulp.task('lint', function () {
    return gulp.src(paths.scripts)
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('jscs', function () {
    return gulp.src(paths.scripts)
        .pipe(jscs())
        .pipe(jscs.reporter());
});

gulp.task('test', function () {
    return gulp.src('./test/*.js')
        .pipe(mocha({ reporter: 'spec' }));
});

gulp.task('watch', function () {
    gulp.watch(paths.scripts, ['lint', 'jscs', 'test']);
});

gulp.task('default', ['lint', 'jscs', 'test', 'watch']);
