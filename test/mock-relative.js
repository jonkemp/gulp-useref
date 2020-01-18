/* eslint-disable */
/* global describe, it */

const should = require('should');
const path = require('path');
const once = require('async-once');

describe('relative files', function () {
    this.timeout(5000);

    it('should handle relative files', done => {
        let seriesFn;
        const gulp = require('gulp');
        const mockGulpDest = require('mock-gulp-dest')(gulp);
        const useref = require('../index');

        function relative() {
            return gulp.src('test/fixtures/relative/**/*.html')
                .pipe(useref())
                .pipe(gulp.dest('fixtures/relative/styles', { cwd: 'test' }));
        }

        seriesFn = gulp.series(relative, once(() => {
            mockGulpDest.cwd().should.equal(__dirname);
            mockGulpDest.basePath().should.equal(path.join(__dirname, 'fixtures/relative/styles'));
            mockGulpDest.assertDestContains([
                'bundle.css'
            ]);

            done();
        }));

        seriesFn();
    });

    it('should handle relative files when base is set', done => {
        let seriesFn;
        const gulp = require('gulp');
        const mockGulpDest = require('mock-gulp-dest')(gulp);
        const useref = require('../index');

        function relativeBase() {
            return gulp.src(['test/fixtures/templates1/**/*.html', 'test/fixtures/templates2/**/*.html'])
                .pipe(useref({
                    searchPath: 'test/fixtures',
                    base: 'test/fixtures'
                }))
                .pipe(gulp.dest('test/dist'));
        }

        seriesFn = gulp.series(relativeBase, once(() => {
            mockGulpDest.basePath().should.equal(path.join(__dirname, 'dist'));
            mockGulpDest.assertDestContains([
                'css/bundle.css',
                'css/combined.css'
            ]);

            done();
        }));

        seriesFn();
    });
});
