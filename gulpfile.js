/* eslint-disable */
const { spawn } = require('child_process');
const gulp = require('gulp');
const eslint = require('gulp-eslint');

const paths = {
    scripts: ['./*.js', './lib/*.js', '!./gulpfile.js']
};

gulp.task('lint', () => gulp.src(paths.scripts)
    .pipe(eslint({fix: true}))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError()));

gulp.task('test', () => spawn(process.execPath, [require.resolve('mocha/bin/mocha')], {
    stdio: 'inherit'
}));

gulp.task('watch', () => {
    gulp.watch(paths.scripts, gulp.parallel('lint', 'test'));
});

gulp.task('default', gulp.parallel('lint', 'test', 'watch'));
