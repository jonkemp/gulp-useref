/* jshint node: true */
/* global describe, it */

var assert = require('assert');
var fs = require('fs');
var path = require('path');
var gutil = require('gulp-util');
var useref = require('../index');

function getFile(filePath) {
    return new gutil.File({
        path:     filePath,
        base:     path.dirname(filePath),
        contents: fs.readFileSync(filePath)
    });
}

function getFixture(filePath) {
    return getFile(path.join('test', 'fixtures', filePath));
}

function getExpected(filePath) {
    return getFile(path.join('test', 'expected', filePath));
}

function compare(name, expectedName, done) {
    var stream = useref();

    stream.on('data', function(newFile) {
        if (path.basename(newFile.path) === name) {
            assert.equal(String(getExpected(expectedName).contents), String(newFile.contents));
        }
    });

    stream.on('end', function() {
        done();
    });

    stream.write(getFixture(name));

    stream.end();
}

describe('gulp-useref', function() {
    it('should replace reference in css block and return replaced files', function(done) {
        compare('01.html', '01.html', done);
    });


    it('should replace reference in js block and return replaced files', function(done) {
        compare('02.html', '02.html', done);
    });

    it('should handle comments and whitespace in blocks', function(done) {
        compare('03.html', '03.html', done);
    });

    it('should handle multiple blocks', function(done) {
        compare('04.html', '04.html', done);
    });
});