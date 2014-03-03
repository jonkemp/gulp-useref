/* jshint node: true */
/* global describe, it */

var should = require('should');
var fs = require('fs');
var path = require('path');
var gutil = require('gulp-util');
var useref = require('..');

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

function compare(htmlFixture, expectedFixture, done) {
    var stream = useref();

    stream.on('data', function(newFile) {
        if (path.basename(newFile.path) === htmlFixture) {
            should(String(getExpected(expectedFixture).contents)).eql(String(newFile.contents));
        }
    });

    stream.on('end', function() {
        done();
    });

    stream.write(getFixture(htmlFixture));

    stream.end();
}

function referencesStream(htmlFixture, cb) {
    var stream = useref();
    cb(stream.references());
    stream.write(getFixture(htmlFixture));
    stream.end();
}

function compareReferences(htmlFixture, assetFixtures, done) {
    var referencesFileCount = 0;
    referencesStream(htmlFixture, function(references) {
        references.on('data', function(referenceFile) {
            should.exist(referenceFile);
            should.exist(referenceFile.path);
            should.exist(referenceFile.relative);
            should.exist(referenceFile.contents);
            referenceFile.relative.should.equal(assetFixtures[referencesFileCount]);
            referenceFile.path.should.equal(path.join('test/fixtures', referenceFile.relative));
            should(String(getExpected(referenceFile.relative).contents)).eql(String(referenceFile.contents));
            ++referencesFileCount;
        });

        references.on('error', function(err) {}); // ignore errors
        references.once('end', function () {
            referencesFileCount.should.equal(assetFixtures.length);
            done();
        });
    });
}

describe('gulp-useref', function() {
    it('file should pass through', function(done) {
        var streamFileCount = 0;

        var fakeFile = new gutil.File({
            path: './test/fixture/file.js',
            cwd: './test/',
            base: './test/fixture/',
            contents: new Buffer('wadup();')
        });

        var stream = useref();
        stream.on('data', function(newFile) {
            should.exist(newFile);
            should.exist(newFile.path);
            should.exist(newFile.relative);
            should.exist(newFile.contents);
            newFile.path.should.equal('./test/fixture/file.js');
            newFile.relative.should.equal('file.js');
            ++streamFileCount;
        });

        stream.once('end', function () {
            streamFileCount.should.equal(1);
            done();
        });

        stream.write(fakeFile);
        stream.end();
    });

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

    it('emits concatenated css', function(done) {
        compareReferences('01.html', ['css/combined.css'], done);
    });

    it('emits concatenated js', function(done) {
        compareReferences('02.html', ['scripts/combined.js'], done);
    });

    it('emits concatenated css & js (specified in multiple blocks)', function(done) {
        compareReferences('04.html', [
            'css/combined.css',
            'css/combined2.css',
            'scripts/combined.js',
            'scripts/combined2.js'
        ], done);
    });

    it('emits errors on reference stream when references are not found', function(done) {
        referencesStream('04.html', function(stream) {
            stream.on('error', function(err) {
                err.message.should.eql("ENOENT, no such file or directory 'test/fixtures/css/four.css'");
                done();
            });
        });
    });
});
