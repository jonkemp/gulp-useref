/* jshint node: true */
/* global describe, it */
'use strict';
var should = require('should');
var fs = require('fs');
var path = require('path');
var gutil = require('gulp-util');
var useref = require('../index');

function getFile(filePath) {
    return new gutil.File({
        path:     filePath,
        cwd:      __dirname,
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
            should(String(getExpected(expectedName).contents)).eql(String(newFile.contents));
        }
    });

    stream.on('end', function() {
        done();
    });

    stream.write(getFixture(name));

    stream.end();
}

describe('useref()', function() {
    it('file should pass through', function(done) {
        var a = 0;

        var fakeFile = new gutil.File({
            path: './test/fixture/file.js',
            cwd: './test/',
            base: './test/fixture/',
            contents: new Buffer('wadup();')
        });

        var stream = useref();
        stream.on('data', function(newFile){
            should.exist(newFile.contents);
            newFile.path.should.equal('./test/fixture/file.js');
            newFile.relative.should.equal('file.js');
            ++a;
        });

        stream.once('end', function () {
            a.should.equal(1);
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
});

describe('useref.assets()', function() {

    it('should return the assets in the order they were found', function(done) {
        var testOrderFile = getFixture('order.html');

        var stream = useref.assets();

        stream.on('data',function(newFile){
            should(String(getExpected('css/ordered.css').contents)).eql(String(newFile.contents));
            done();
        });

        stream.write(testOrderFile);

        stream.end();
    });

    it('should expand globs?', function(done) {
        var testExpandFile = getFixture('expand.html');
        var stream = useref.assets({noconcat:true});

        var count = 0;

        stream.on('data',function(newFile){
            count++;
        });

        stream.on('end', function () {
            if(count > 1) {
                done();
            } else {
                done(new Error("Did not expand"));
            }
        })

        stream.write(testExpandFile);

        stream.end();
    });

    it('should emit an error with the option mustexist = true if one of the assets is not found', function(done) {
        var testNonExistentFile = getFixture('nonexistent.html');
        var stream = useref.assets({mustexist:true});

        var expectedError = null;
        stream.on('error',function(error){
            expectedError = error;
        });

        stream.on('end', function() {
            if(expectedError == null) {
                done(new Error("Reached the end without error"));
            } else {
                done();
            }
        });

        stream.write(testNonExistentFile);
        stream.end();

    });

    it('should not emit an error with the option mustexist = false  if one of the assets is not found', function(done) {
        var testNonExistentFile = getFixture('nonexistent.html');
        var stream = useref.assets({mustexist:false});

        var expectedError = null;
        stream.on('error',function(error){
            expectedError = error;
        });

        stream.on('end', function() {
            if(expectedError == null) {
                done();
            } else {
                done(new Error("Got error event though mustexist was false"));

            }
        });

        stream.write(testNonExistentFile);
        stream.end();

    });

    it('should concat CSS assets and pass them through', function(done) {
        var a = 0;

        var testFile = getFixture('01.html');

        var stream = useref.assets();

        stream.on('data', function(newFile){
            should.exist(newFile.contents);
            newFile.path.should.equal(path.normalize('./test/fixtures/css/combined.css'));
            ++a;
        });

        stream.once('end', function () {
            a.should.equal(1);
            done();
        });

        stream.write(testFile);

        stream.end();
    });

    it('should skip concatenation and pass CSS assets through with noconcat option', function(done) {
        var a = 0;

        var testFile = getFixture('01.html');

        var stream = useref.assets({ noconcat: true });

        stream.on('data', function(newFile){
            should.exist(newFile.contents);
            if (a === 1) {
                newFile.path.should.equal(path.join(__dirname, './fixtures/css/two.css'));
            } else if (a === 2) {
                newFile.path.should.equal(path.join(__dirname, './fixtures/css/one.css'));
            }
            ++a;
        });

        stream.once('end', function () {
            a.should.equal(2);
            done();
        });

        stream.write(testFile);

        stream.end();
    });

    it('should concat JS assets and pass them through', function(done) {
        var a = 0;

        var testFile = getFixture('02.html');

        var stream = useref.assets();

        stream.on('data', function(newFile){
            should.exist(newFile.contents);
            newFile.path.should.equal(path.normalize('./test/fixtures/scripts/combined.js'));
            ++a;
        });

        stream.once('end', function () {
            a.should.equal(1);
            done();
        });

        stream.write(testFile);

        stream.end();
    });

    it('should skip concatenation and pass JS assets through with noconcat option', function(done) {
        var a = 0;

        var testFile = getFixture('02.html');

        var stream = useref.assets({ noconcat: true });

        stream.on('data', function(newFile){
            should.exist(newFile.contents);
            if (a === 1) {
                newFile.path.should.equal(path.join(__dirname, './fixtures/scripts/that.js'));
            } else if (a === 2) {
                newFile.path.should.equal(path.join(__dirname, './fixtures/scripts/this.js'));
            }
            ++a;
        });

        stream.once('end', function () {
            a.should.equal(2);
            done();
        });

        stream.write(testFile);

        stream.end();
    });

    it('should handle an alternate css search path', function(done) {
        var a = 0;

        var testFile = getFixture('05.html');

        var stream = useref.assets();

        stream.on('data', function(newFile){
            should.exist(newFile.contents);
            newFile.path.should.equal(path.normalize('./test/fixtures/css/combined.css'));
            ++a;
        });

        stream.once('end', function () {
            a.should.equal(1);
            done();
        });

        stream.write(testFile);

        stream.end();
    });

    it('should handle an alternate js search path', function(done) {
        var a = 0;

        var testFile = getFixture('06.html');

        var stream = useref.assets();

        stream.on('data', function(newFile){
            should.exist(newFile.contents);
            newFile.path.should.equal(path.normalize('./test/fixtures/scripts/combined.js'));
            ++a;
        });

        stream.once('end', function () {
            a.should.equal(1);
            done();
        });

        stream.write(testFile);

        stream.end();
    });

    it('should get the alternate search path from options', function(done) {
        var a = 0;

        var testFile = getFixture('07.html');

        var stream = useref.assets({
            searchPath: '.tmp'
        });

        stream.on('data', function(newFile){
            should.exist(newFile.contents);
            switch (newFile.path) {
                case path.normalize('./test/fixtures/scripts/main.js'):
                    newFile.path.should.equal(path.normalize('./test/fixtures/scripts/main.js'));
                    break;
                case path.normalize('./test/fixtures/css/combined.css'):
                    newFile.path.should.equal(path.normalize('./test/fixtures/css/combined.css'));
                    break;
            }
            ++a;
        });

        stream.once('end', function () {
            a.should.equal(2);
            done();
        });

        stream.write(testFile);

        stream.end();
    });

    it('should get the alternate search paths from options with brace expansion', function(done) {
        var a = 0;

        var testFile = getFixture('alternate-search-paths.html');

        var stream = useref.assets({
            searchPath: '{.tmp,fixtures}'
        });

        stream.on('data', function(newFile){
            should.exist(newFile.contents);
            switch (newFile.path) {
                case path.normalize('./test/fixtures/scripts/main.js'):
                    newFile.path.should.equal(path.normalize('./test/fixtures/scripts/main.js'));
                    break;
                case path.normalize('./test/fixtures/css/combined.css'):
                    newFile.path.should.equal(path.normalize('./test/fixtures/css/combined.css'));
                    break;
            }
            ++a;
        });

        stream.once('end', function () {
            a.should.equal(2);
            done();
        });

        stream.write(testFile);

        stream.end();
    });

    it('should get assets with parent directory reference using brace expansion', function(done) {
        var a = 0;

        var testFile = getFixture('07.html');

        var stream = useref.assets({
            searchPath: '.{,t{,m}}p,../another/search/path'
        });

        stream.on('data', function(newFile){
            should.exist(newFile.contents);
            switch (newFile.path) {
                case path.normalize('./test/fixtures/scripts/main.js'):
                    newFile.path.should.equal(path.normalize('./test/fixtures/scripts/main.js'));
                    break;
                case path.normalize('./test/fixtures/css/combined.css'):
                    newFile.path.should.equal(path.normalize('./test/fixtures/css/combined.css'));
                    break;
            }
            ++a;
        });

        stream.once('end', function () {
            a.should.equal(2);
            done();
        });

        stream.write(testFile);

        stream.end();
    });

    it('should handle an alternate search path in multiple build blocks', function(done) {
        var a = 0;

        var testFile = getFixture('08.html');

        var stream = useref.assets();

        stream.on('data', function(newFile){
            var assetpath = [
                './test/fixtures/css/combined.css',
                './test/fixtures/scripts/combined.min.js',
                './test/fixtures/scripts/combined2.min.js'
            ];

            assetpath.forEach(function (filepath) {
                if (newFile.path === path.normalize(filepath)) {
                    should.exist(newFile.contents);
                    newFile.path.should.equal(path.normalize(filepath));
                    ++a;
                }
            });
        });

        stream.once('end', function () {
            a.should.equal(3);
            done();
        });

        stream.write(testFile);

        stream.end();
    });

    it('should ignore build blocks with no assets', function(done) {
        var a = 0;

        var testFile = getFixture('09.html');

        var stream = useref.assets();

        stream.on('data', function(newFile){
            should.exist(newFile.contents);
            newFile.path.should.not.equal(path.normalize('./test/fixtures/css/vendor.css'));
            ++a;
        });

        stream.once('end', function () {
            a.should.equal(0);
            done();
        });

        stream.write(testFile);

        stream.end();
    });

    it('should work with relative paths', function(done) {
        var a = 0;

        var testFile = getFixture('10.html');

        var stream = useref.assets();

        stream.on('data', function(newFile){
            should.exist(newFile.contents);
            newFile.path.should.equal(path.normalize('./test/fixtures/scripts/combined.js'));
            ++a;
        });

        stream.once('end', function () {
            a.should.equal(1);
            done();
        });

        stream.write(testFile);

        stream.end();
    });

    it('should ignore absolute urls', function(done) {
        var a = 0;

        var testFile = getFixture('remote-path.html');

        var stream = useref.assets();

        stream.on('data', function(newFile){
            should.exist(newFile.contents);
            newFile.path.should.equal(path.normalize('./test/fixtures/css/combined.css'));
            ++a;
        });

        stream.once('end', function () {
            a.should.equal(1);
            done();
        });

        stream.write(testFile);

        stream.end();
    });
});

describe('useref.restore()', function() {
    it('should bring back the previously filtered files', function(done) {
        var testFile = getFixture('01.html');

        var stream = useref.assets();
        var buffer = [];

        var completeStream = stream.pipe(stream.restore());

        completeStream.on('data', function (file) {
            buffer.push(file);
        });

        completeStream.on('end', function () {
            buffer[0].path.should.equal(path.normalize('./test/fixtures/01.html'));
            should(String(buffer[0].contents)).eql(String(testFile.contents));
            done();
        });

        stream.write(testFile);

        stream.end();
    });
});
