/* eslint-disable */
const gulp = require('gulp');
const mocha = require('gulp-mocha');
const eslint = require('gulp-eslint');

const paths = {
    scripts: ['./*.js', './lib/*.js', '!./gulpfile.js']
};

gulp.task('lint', () => gulp.src(paths.scripts)
    .pipe(eslint({fix: true}))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError()));

gulp.task('test', () => gulp.src('./test/*.js')
    .pipe(mocha({ reporter: 'spec' })));

gulp.task('watch', () => {
    gulp.watch(paths.scripts, gulp.parallel('lint', 'test'));
});

gulp.task('default', gulp.parallel('lint', 'test', 'watch'));
