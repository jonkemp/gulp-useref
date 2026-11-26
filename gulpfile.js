/* eslint-disable */
const { spawn } = require('child_process');
const { dirname, join } = require('path');
const gulp = require('gulp');

const eslintCli = join(dirname(require.resolve('eslint/package.json')), 'bin/eslint.js');

const paths = {
    scripts: ['./*.js', './lib/*.js', '!./gulpfile.js']
};

gulp.task('lint', () => spawn(process.execPath, [eslintCli, '--fix-dry-run', '*.js', 'lib/*.js'], {
    stdio: 'inherit'
}));

gulp.task('test', () => spawn(process.execPath, [require.resolve('mocha/bin/mocha')], {
    stdio: 'inherit'
}));

gulp.task('watch', () => {
    gulp.watch(paths.scripts, gulp.parallel('lint', 'test'));
});

gulp.task('default', gulp.parallel('lint', 'test', 'watch'));
