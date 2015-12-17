/* eslint-disable */
/* global describe, it */

'use strict';
var should = require('should');
var path = require('path');

describe('useref()', function () {
    this.timeout(5000);

    it('should handle relative files', function (done) {
        var gulp = require('gulp');
        var mockGulpDest = require('mock-gulp-dest')(gulp);

        var useref = require('../index');

        gulp.task('relative', function () {
            return gulp.src('test/fixtures/relative/**/*.html')
                .pipe(useref())
                .pipe(gulp.dest('fixtures/relative/styles', { cwd: 'test' }));
        });

        gulp.start('relative')
            .once('stop', function () {
                mockGulpDest.cwd().should.equal(__dirname);
                mockGulpDest.basePath().should.equal(path.join(__dirname, 'fixtures/relative/styles'));
                mockGulpDest.assertDestContains([
                    'bundle.css'
                ]);

                done();
            });
    });
});
