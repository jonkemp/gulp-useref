/* eslint-disable */
/* global describe, it */
const should = require('should');
const fs = require('fs');
const path = require('path');
const Vinyl = require('vinyl');
const es = require('event-stream');
const useref = require('../index');
const gulp = require('gulp');
const rename = require('gulp-rename');
const through = require('through2');

function getFile(filePath) {
    return new Vinyl({
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
    const stream = useref({ noAssets: true });

    stream.on('data', newFile => {
        if (path.basename(newFile.path) === name) {
            should(String(getExpected(expectedName).contents)).eql(String(newFile.contents));
        }
    });

    stream.on('end', () => {
        done();
    });

    stream.write(getFixture(name));

    stream.end();
}

describe('useref()', function() {
    this.timeout(5000);

    it('file should pass through', done => {
        let a = 0;

        const fakeFile = new Vinyl({
            path: '/test/fixture/file.js',
            cwd: '/test/',
            base: '/test/fixture/',
            contents: Buffer.from('wadup();')
        });

        const stream = useref();
        stream.on('data', newFile => {
            should.exist(newFile.contents);
            newFile.path.should.equal('/test/fixture/file.js');
            newFile.relative.should.equal('file.js');
            ++a;
        });

        stream.once('end', () => {
            a.should.equal(1);
            done();
        });

        stream.write(fakeFile);
        stream.end();
    });

    it('should let null files pass through', done => {
        const stream = useref({ noAssets: true });
        let n = 0;

        stream.pipe(es.through(file => {
            should.equal(file.path, 'null.md');
            should.equal(file.contents,  null);
            n++;
        }, () => {
            should.equal(n, 1);
            done();
        }));

        stream.write(new Vinyl({
            path: 'null.md',
            contents: null
         }));

        stream.end();
    });

    it('should emit error on streamed file', done => {
        gulp.src(path.join('test', 'fixtures', '01.html'), { buffer: false })
            .pipe(useref({ noAssets: true }))
            .on('error', ({message}) => {
                message.should.equal('Streaming not supported');
                done();
            });
    });

    it('should replace reference in css block and return replaced files', done => {
        compare('01.html', '01.html', done);
    });

    it('should replace reference in js block and return replaced files', done => {
        compare('02.html', '02.html', done);
    });

    it('should handle comments and whitespace in blocks', done => {
        compare('03.html', '03.html', done);
    });

    it('should handle multiple blocks', done => {
        compare('04.html', '04.html', done);
    });

    it('should handle custom blocks', done => {
        const stream = useref({
            noAssets: true,
            custom(content, target) {
                return content === 'someContent' ? target : content;
            }
        });

        stream.on('data', ({contents}) => {
            getExpected('custom-blocks.html').contents.toString().should.equal(contents.toString());
        });

        stream.on('end', done);

        stream.write(getFixture('custom-blocks.html'));
        stream.end();
    });

    it('should concat CSS assets and pass them through', done => {
        let a = 0;

        const testFile = getFixture('01.html');

        const stream = useref();

        stream.on('data', newFile => {
            should.exist(newFile.contents);
            if (a === 1) {
                newFile.path.should.equal(path.normalize('./test/fixtures/css/combined.css'));
            }
            ++a;
        });

        stream.once('end', () => {
            a.should.equal(2);
            done();
        });

        stream.write(testFile);

        stream.end();
    });

    it('should concat CSS assets with newLine option', done => {
        let a = 0;
        const testFile = getFixture('01.html');
        const separator = '\r\n';
        const stream = useref({newLine: separator});
        const buffer1 = Buffer.from(fs.readFileSync(path.join('test', 'fixtures', 'css', 'one.css')));
        const buffer2 = Buffer.from(separator);
        const buffer3 = Buffer.from(fs.readFileSync(path.join('test', 'fixtures', 'css', 'two.css')));
        const bufferFinal = Buffer.concat([buffer1, buffer2, buffer3]);
        const fileFinal =  new Vinyl({ contents: bufferFinal });

        stream.on('data', newFile => {
            if (a === 1) {
                newFile.path.should.equal(path.normalize('./test/fixtures/css/combined.css'));
                newFile.contents.toString().should.equal(fileFinal.contents.toString());
            }
            ++a;
        });

        stream.once('end', () => {
            a.should.equal(2);
            done();
        });

        stream.write(testFile);

        stream.end();
    });

    it('should concat CSS assets but skip newLine option if semicolon', done => {
        let a = 0;
        const testFile = getFixture('01.html');
        const separator = ';';
        const stream = useref({newLine: separator});
        const buffer1 = Buffer.from(fs.readFileSync(path.join('test', 'fixtures', 'css', 'one.css')));
        const buffer2 = Buffer.from('\n');
        const buffer3 = Buffer.from(fs.readFileSync(path.join('test', 'fixtures', 'css', 'two.css')));
        const bufferFinal = Buffer.concat([buffer1, buffer2, buffer3]);
        const fileFinal =  new Vinyl({ contents: bufferFinal });

        stream.on('data', newFile => {
            if (a === 1) {
                newFile.path.should.equal(path.normalize('./test/fixtures/css/combined.css'));
                newFile.contents.toString().should.equal(fileFinal.contents.toString());
            }
            ++a;
        });

        stream.once('end', () => {
            a.should.equal(2);
            done();
        });

        stream.write(testFile);

        stream.end();
    });

    it('should skip concatenation and pass CSS assets through with noconcat option', done => {
        let a = 0;

        const testFile = getFixture('01.html');

        const stream = useref({ noconcat: true });

        stream.on('data', newFile => {
            should.exist(newFile.contents);

            if (a === 0) {
                getExpected('noconcat-css.html').contents.toString().should.equal(newFile.contents.toString());
            } else if (a === 1) {
                path.normalize(newFile.path).should.equal(path.join(__dirname, './fixtures/css/one.css'));
            } else if (a === 2) {
                path.normalize(newFile.path).should.equal(path.join(__dirname, './fixtures/css/two.css'));
            }
            ++a;
        });

        stream.once('end', () => {
            a.should.equal(3);
            done();
        });

        stream.write(testFile);

        stream.end();
    });

    it('should concat JS assets and pass them through', done => {
        let a = 0;

        const testFile = getFixture('02.html');

        const stream = useref();

        stream.on('data', newFile => {
            should.exist(newFile.contents);
            if (a === 1) {
                newFile.path.should.equal(path.normalize('./test/fixtures/scripts/combined.js'));
            }
            ++a;
        });

        stream.once('end', () => {
            a.should.equal(2);
            done();
        });

        stream.write(testFile);

        stream.end();
    });

    it('should concat JS assets with newLine option', done => {
        let a = 0;
        const testFile = getFixture('02.html');
        const separator = '\r\n';
        const stream = useref({newLine: separator});
        const buffer1 = Buffer.from(fs.readFileSync(path.join('test', 'fixtures', 'scripts', 'this.js')));
        const buffer2 = Buffer.from(separator);
        const buffer3 = Buffer.from(fs.readFileSync(path.join('test', 'fixtures', 'scripts', 'that.js')));
        const bufferFinal = Buffer.concat([buffer1, buffer2, buffer3]);
        const fileFinal =  new Vinyl({ contents: bufferFinal });

        stream.on('data', newFile => {
            if (a === 1) {
                newFile.path.should.equal(path.normalize('./test/fixtures/scripts/combined.js'));
                newFile.contents.toString().should.equal(fileFinal.contents.toString());
            }
            ++a;
        });

        stream.once('end', () => {
            a.should.equal(2);
            done();
        });

        stream.write(testFile);

        stream.end();
    });

    it('should concat JS assets with newLine option if semicolon', done => {
        let a = 0;
        const testFile = getFixture('02.html');
        const separator = ';';
        const stream = useref({newLine: separator});
        const buffer1 = Buffer.from(fs.readFileSync(path.join('test', 'fixtures', 'scripts', 'this.js')));
        const buffer2 = Buffer.from(separator);
        const buffer3 = Buffer.from(fs.readFileSync(path.join('test', 'fixtures', 'scripts', 'that.js')));
        const bufferFinal = Buffer.concat([buffer1, buffer2, buffer3]);
        const fileFinal =  new Vinyl({ contents: bufferFinal });

        stream.on('data', newFile => {
            if (a === 1) {
                newFile.path.should.equal(path.normalize('./test/fixtures/scripts/combined.js'));
                newFile.contents.toString().should.equal(fileFinal.contents.toString());
            }
            ++a;
        });

        stream.once('end', () => {
            a.should.equal(2);
            done();
        });

        stream.write(testFile);

        stream.end();
    });

    it('should skip concatenation and pass JS assets through with noconcat option', done => {
        let a = 0;

        const testFile = getFixture('02.html');

        const stream = useref({ noconcat: true });

        stream.on('data', newFile => {
            should.exist(newFile.contents);

            if (a === 0) {
                getExpected('noconcat-js.html').contents.toString().should.equal(newFile.contents.toString());
            } else if (a === 1) {
                path.normalize(newFile.path).should.equal(path.join(__dirname, './fixtures/scripts/this.js'));
            } else if (a === 2) {
                path.normalize(newFile.path).should.equal(path.join(__dirname, './fixtures/scripts/that.js'));
            }
            ++a;
        });

        stream.once('end', () => {
            a.should.equal(3);
            done();
        });

        stream.write(testFile);

        stream.end();
    });

    it('should handle an alternate css search path', done => {
        let a = 0;

        const testFile = getFixture('05.html');

        const stream = useref();

        stream.on('data', newFile => {
            should.exist(newFile.contents);
            if (a === 1) {
                newFile.path.should.equal(path.normalize('./test/fixtures/css/combined.css'));
            }
            ++a;
        });

        stream.once('end', () => {
            a.should.equal(2);
            done();
        });

        stream.write(testFile);

        stream.end();
    });

    it('should handle an alternate js search path', done => {
        let a = 0;

        const testFile = getFixture('06.html');

        const stream = useref();

        stream.on('data', newFile => {
            should.exist(newFile.contents);
            if (a === 1) {
                newFile.path.should.equal(path.normalize('./test/fixtures/scripts/combined.js'));
            }
            ++a;
        });

        stream.once('end', () => {
            a.should.equal(2);
            done();
        });

        stream.write(testFile);

        stream.end();
    });

    it('should handle an alternate js search path with file separator', done => {
        let a = 0;

        const testFile = getFixture('12.html');

        const stream = useref();

        stream.on('data', newFile => {
            should.exist(newFile.contents);
            if (a === 1) {
                newFile.path.should.equal(path.normalize('./test/fixtures/scripts/combined.js'));
            }
            ++a;
        });

        stream.once('end', () => {
            a.should.equal(2);
            done();
        });

        stream.write(testFile);

        stream.end();
    });

    it('should get the alternate search path from options via string', done => {
        let a = 0;

        const testFile = getFixture('07.html');

        const stream = useref({
            searchPath: '.tmp'
        });

        stream.on('data', newFile => {
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

        stream.once('end', () => {
            a.should.equal(3);
            done();
        });

        stream.write(testFile);

        stream.end();
    });

    it('should get the alternate search path from options via array', done => {
        let a = 0;

        const testFile = getFixture('07.html');

        const stream = useref({
            searchPath: ['.tmp']
        });

        stream.on('data', newFile => {
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

        stream.once('end', () => {
            a.should.equal(3);
            done();
        });

        stream.write(testFile);

        stream.end();
    });

    it('should get the alternate search paths from options via array', done => {
        let a = 0;

        const testFile = getFixture('alternate-search-paths.html');

        const stream = useref({
            searchPath: ['.tmp', 'fixtures']
        });

        stream.on('data', newFile => {
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

        stream.once('end', () => {
            a.should.equal(3);
            done();
        });

        stream.write(testFile);

        stream.end();
    });

    it('should get the alternate search paths from options with brace expansion', done => {
        let a = 0;

        const testFile = getFixture('alternate-search-paths.html');

        const stream = useref({
            searchPath: '{.tmp,fixtures}'
        });

        stream.on('data', newFile => {
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

        stream.once('end', () => {
            a.should.equal(3);
            done();
        });

        stream.write(testFile);

        stream.end();
    });

    it('should get assets with parent directory reference using brace expansion', done => {
        let a = 0;

        const testFile = getFixture('07.html');

        const stream = useref({
            searchPath: '{.{,t{,m}}p,../another/search/path}'
        });

        stream.on('data', newFile => {
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

        stream.once('end', () => {
            a.should.equal(3);
            done();
        });

        stream.write(testFile);

        stream.end();
    });

    it('should handle an alternate search path in multiple build blocks', done => {
        let a = 0;

        const testFile = getFixture('08.html');

        const stream = useref();

        stream.on('data', newFile => {
            const assetpath = [
                './test/fixtures/css/combined.css',
                './test/fixtures/scripts/combined.min.js',
                './test/fixtures/scripts/combined2.min.js'
            ];

            assetpath.forEach(filepath => {
                if (newFile.path === path.normalize(filepath)) {
                    should.exist(newFile.contents);
                    newFile.path.should.equal(path.normalize(filepath));
                    ++a;
                }
            });
        });

        stream.once('end', () => {
            a.should.equal(3);
            done();
        });

        stream.write(testFile);

        stream.end();
    });

    it('should ignore build blocks with no assets', done => {
        let a = 0;

        const testFile = getFixture('09.html');

        const stream = useref();

        stream.on('data', newFile => {
            should.exist(newFile.contents);
            newFile.path.should.not.equal(path.normalize('./test/fixtures/css/vendor.css'));
            ++a;
        });

        stream.once('end', () => {
            a.should.equal(1);
            done();
        });

        stream.write(testFile);

        stream.end();
    });

    it('should understand absolute search paths', done => {
        let a = 0;

        const testFile = getFixture('absolute-search-path.html');

        const searchPath = path.join(__dirname, 'fixtures', 'css');

        const stream = useref({
            searchPath
        });

        stream.on('data', newFile => {
            should.exist(newFile.contents);
            if (a === 1) {
                newFile.path.should.equal(path.normalize('./test/fixtures/css/combined.css'));
            }
            ++a;
        });

        stream.once('end', () => {
            a.should.equal(2);
            done();
        });

        stream.write(testFile);

        stream.end();
    });

    it('should not explode on custom blocks', done => {
        const stream = useref();

        stream.on('end', () => {
            done();
        });

        stream.resume();

        stream.write(getFixture('custom-blocks.html'));
        stream.end();
    });

    it('should work with relative paths', done => {
        let a = 0;

        const testFile = getFixture('10.html');

        const stream = useref();

        stream.on('data', newFile => {
            should.exist(newFile.contents);
            if (a === 1) {
                path.normalize(newFile.path).should.equal(path.normalize('./test/fixtures/scripts/combined.js'));
            }
            ++a;
        });

        stream.once('end', () => {
            a.should.equal(2);
            done();
        });

        stream.write(testFile);

        stream.end();
    });

    it('should ignore absolute urls', done => {
        let a = 0;

        const testFile = getFixture('remote-path.html');

        const stream = useref();

        stream.on('data', newFile => {
            should.exist(newFile.contents);
            if (a === 1) {
                path.normalize(newFile.path).should.equal(path.normalize('./test/fixtures/css/combined.css'));
            }
            ++a;
        });

        stream.once('end', () => {
            a.should.equal(2);
            done();
        });

        stream.write(testFile);

        stream.end();
    });

    it('should transform paths when transformPath function is set', done => {
        let a = 0;

        const testFile = getFixture('bad-path.html');

        const stream = useref({
            transformPath(filePath) {
                return filePath.replace('/rootpath','');
            }
        });

        stream.on('data', newFile => {
            should.exist(newFile.contents);
            if (a === 1) {
                path.normalize(newFile.path).should.equal(path.normalize('./test/fixtures/css/combined.css'));
            }
            ++a;
        });

        stream.once('end', () => {
            a.should.equal(2);
            done();
        });

        stream.write(testFile);

        stream.end();
    });

    it('should return the assets in the order they were found', done => {
        const testOrderFile = getFixture('order.html');

        const stream = useref();

        stream.on('data',newFile => {
            if (newFile.path === path.normalize('./test/fixtures/css/ordered.css')) {
                should(String(getExpected('css/ordered.css').contents)).eql(String(newFile.contents));

                done();
            }
        });

        stream.write(testOrderFile);

        stream.end();
    });

    it('should output assets to a folder relative to the cwd', done => {
        let a = 0;

        const testFile = getFixture('02.html');

        const stream = useref({ base: 'app' });

        stream.on('data', newFile => {
            should.exist(newFile.contents);
            if (a === 1) {
                path.normalize(newFile.path).should.equal(path.normalize('./app/scripts/combined.js'));
            }
            ++a;
        });

        stream.once('end', () => {
            a.should.equal(2);
            done();
        });

        stream.write(testFile);

        stream.end();
    });

    it('should find assets relative to the root', done => {
        let a = 0;

        const testFile = getFixture(path.join('relative', 'child', 'index.html'));

        const stream = useref();

        stream.on('data', newFile => {
            should.exist(newFile.contents);
            if (a === 1) {
                path.normalize(newFile.path).should.equal(path.normalize('./test/fixtures/relative/styles/bundle.css'));
            }
            ++a;
        });

        stream.once('end', () => {
            a.should.equal(2);
            done();
        });

        stream.write(testFile);

        stream.end();
    });

    it('should set file.base when asked', done => {
        let a = 0;

        const testFile = getFixture(path.join('templates1', 'component.html'));

        const stream = useref({
            searchPath: 'fixtures',
            base: 'fixtures'
        });

        stream.on('data', newFile => {
            should.exist(newFile.contents);
            if (a === 1) {
                path.normalize(newFile.path).should.equal(path.normalize('./fixtures/css/bundle.css'));
                path.normalize(newFile.relative).should.equal(path.normalize('css/bundle.css'));
            }
            ++a;
        });

        stream.once('end', () => {
            a.should.equal(2);
            done();
        });

        stream.write(testFile);

        stream.end();
    });

    it('should support external streams', done => {
        const extStream1 = gulp.src('test/fixtures/scripts/that.js')
            .pipe(rename('renamedthat.js'));

        const extStream2 = gulp.src('test/fixtures/scripts/yetonemore.js')
            .pipe(rename('renamedyet.js'));

        let fileCount = 0;

        const assets = useref({
            noconcat: true,
            additionalStreams: [extStream1, extStream2]
        });

        gulp.src('test/fixtures/11.html')
            .pipe(assets)
            .pipe(through.obj((newFile, enc, callback) => {
                const assetpath = [
                    `${__dirname}/fixtures/11.html`,
                    `${__dirname}/fixtures/scripts/this.js`,
                    `${__dirname}/fixtures/scripts/anotherone.js`,
                    `${__dirname}/fixtures/scripts/renamedthat.js`,
                    `${__dirname}/fixtures/scripts/renamedyet.js`
                ];

                assetpath.forEach(filepath => {
                    if (newFile.path === path.normalize(filepath)) {
                        should.exist(newFile.contents);
                        newFile.path.should.equal(path.normalize(filepath));
                        fileCount++;
                    }
                });
                callback();
            }, () => {
                fileCount.should.equal(5);
                done();
            }));
    });
});

describe('on error', () => {
    it('should emit an error if one of the assets is not found', done => {
        const testNonExistentFile = getFixture('nonexistent.html');
        const stream = useref();

        stream.on('error', err => {
            err.should.match(/File not found with singular glob/);
            done();
        });

        stream.write(testNonExistentFile);
        stream.end();

    });
});
