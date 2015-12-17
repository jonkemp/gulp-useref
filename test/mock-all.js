/* eslint-disable */
/* global describe, it */

'use strict';
var should = require('should');
var path = require('path');

describe('useref', function () {
    this.timeout(5000);

    it('should handle all files', function (done) {
        var gulp = require('gulp');
        var mockGulpDest = require('mock-gulp-dest')(gulp);

        var useref = require('../index');

        gulp.task('bulk', function () {
            return gulp.src('test/fixtures/bulk/useref.*.html')
                .pipe(useref())
                .pipe(gulp.dest('dest', { cwd: 'test' }));
        });

        gulp.start('bulk')
            .once('stop', function () {
                mockGulpDest.cwd().should.equal(__dirname);
                mockGulpDest.basePath().should.equal(path.join(__dirname, 'dest'));
                mockGulpDest.assertDestContains([
                    'useref.01.min.css',
                    'useref.02.min.css',
                    'useref.03.min.css',
                    'useref.04.min.css',
                    'useref.05.min.css',
                    'useref.06.min.css',
                    'useref.07.min.css',
                    'useref.08.min.css',
                    'useref.09.min.css',
                    'useref.10.min.css',
                    'useref.11.min.css',
                    'useref.12.min.css',
                    'useref.13.min.css',
                    'useref.14.min.css',
                    'useref.15.min.css',
                    'useref.16.min.css',
                    'useref.17.min.css',
                    'useref.18.min.css',
                    'useref.19.min.css',
                    'useref.20.min.css',
                    'useref.21.min.css',
                    'useref.22.min.css',
                    'useref.23.min.css',
                    'useref.24.min.css',
                    'useref.25.min.css',
                    'useref.26.min.css',
                    'useref.27.min.css',
                    'useref.28.min.css',
                    'useref.29.min.css',
                    'useref.30.min.css',
                    'useref.31.min.css',
                    'useref.32.min.css',
                    'useref.33.min.css',
                    'useref.34.min.css',
                    'useref.35.min.css',
                    'useref.36.min.css',
                    'useref.37.min.css',
                    'useref.38.min.css',
                    'useref.39.min.css'
                ]);

                done();
            });
    });
});
