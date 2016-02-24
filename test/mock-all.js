/* eslint-disable */
/* global describe, it */

'use strict';
var should = require('should');
var path = require('path');
var gulp = require('gulp');
var useref = require('../index');
var through = require('through2');

describe('bulk files', function () {
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
                    'useref.01.html',
                    'useref.02.html',
                    'useref.03.html',
                    'useref.04.html',
                    'useref.05.html',
                    'useref.06.html',
                    'useref.07.html',
                    'useref.08.html',
                    'useref.09.html',
                    'useref.10.html',
                    'useref.11.html',
                    'useref.12.html',
                    'useref.13.html',
                    'useref.14.html',
                    'useref.15.html',
                    'useref.16.html',
                    'useref.17.html',
                    'useref.18.html',
                    'useref.19.html',
                    'useref.20.html',
                    'useref.21.html',
                    'useref.22.html',
                    'useref.23.html',
                    'useref.24.html',
                    'useref.25.html',
                    'useref.26.html',
                    'useref.27.html',
                    'useref.28.html',
                    'useref.29.html',
                    'useref.30.html',
                    'useref.31.html',
                    'useref.32.html',
                    'useref.33.html',
                    'useref.34.html',
                    'useref.35.html',
                    'useref.36.html',
                    'useref.37.html',
                    'useref.38.html',
                    'useref.39.html',
                    'useref.40.html',
                    'useref.41.html',
                    'useref.42.html',
                    'useref.43.html',
                    'useref.44.html',
                    'useref.45.html',
                    'useref.46.html',
                    'useref.47.html',
                    'useref.48.html',
                    'useref.49.html',
                    'useref.50.html',
                    'useref.51.html',
                    'useref.52.html',
                    'useref.53.html',
                    'useref.54.html',
                    'useref.55.html',
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
                    'useref.39.min.css',
                    'useref.40.min.css',
                    'useref.41.min.css',
                    'useref.42.min.css',
                    'useref.43.min.css',
                    'useref.44.min.css',
                    'useref.45.min.css',
                    'useref.46.min.css',
                    'useref.47.min.css',
                    'useref.48.min.css',
                    'useref.49.min.css',
                    'useref.50.min.css',
                    'useref.51.min.css',
                    'useref.52.min.css',
                    'useref.53.min.css',
                    'useref.54.min.css',
                    'useref.55.min.css'
                ]);

                done();
            });
    });

    it('should handle all assets', function (done) {
        var gulp = require('gulp');
        var mockGulpDest = require('mock-gulp-dest')(gulp);

        var useref = require('../index');

        gulp.task('bulk', function () {
            return gulp.src('test/fixtures/bulk/useref.56.html')
                .pipe(useref({ noconcat: true }))
                .pipe(gulp.dest('dest', { cwd: 'test' }));
        });

        gulp.start('bulk')
            .once('stop', function () {
                mockGulpDest.cwd().should.equal(__dirname);
                mockGulpDest.basePath().should.equal(path.join(__dirname, 'dest'));
                mockGulpDest.assertDestContains([
                    'useref.56.html',
                    'useref.01.css',
                    'useref.02.css',
                    'useref.03.css',
                    'useref.04.css',
                    'useref.05.css',
                    'useref.06.css',
                    'useref.07.css',
                    'useref.08.css',
                    'useref.09.css',
                    'useref.10.css',
                    'useref.11.css',
                    'useref.12.css',
                    'useref.13.css',
                    'useref.14.css',
                    'useref.15.css',
                    'useref.16.css',
                    'useref.17.css',
                    'useref.18.css',
                    'useref.19.css',
                    'useref.20.css',
                    'useref.21.css',
                    'useref.22.css',
                    'useref.23.css',
                    'useref.24.css',
                    'useref.25.css',
                    'useref.26.css',
                    'useref.27.css',
                    'useref.28.css',
                    'useref.29.css',
                    'useref.30.css',
                    'useref.31.css',
                    'useref.32.css',
                    'useref.33.css',
                    'useref.34.css',
                    'useref.35.css',
                    'useref.36.css',
                    'useref.37.css',
                    'useref.38.css',
                    'useref.39.css',
                    'useref.40.css',
                    'useref.41.css',
                    'useref.42.css',
                    'useref.43.css',
                    'useref.44.css',
                    'useref.45.css',
                    'useref.46.css',
                    'useref.47.css',
                    'useref.48.css',
                    'useref.49.css',
                    'useref.50.css',
                    'useref.51.css',
                    'useref.52.css',
                    'useref.53.css',
                    'useref.54.css',
                    'useref.55.css',
                    'useref.56.css'
                ]);

                done();
            });
    });

    it('should not end the stream prematurely', function (done) {
        var fileCount = 0;

        gulp.src('test/fixtures/04.html')
            .pipe(useref())
            .pipe(through.obj({ highWaterMark: 1 }, function (newFile, enc, callback) {
                fileCount++;
                setTimeout(callback, 750);
            }, function (cb) {
                fileCount.should.equal(5);
                done();
                cb();
            }));
    });
});
