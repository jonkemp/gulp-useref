'use strict';
var gutil = require('gulp-util'),
    through = require('through2'),
    useref = require('node-useref');

module.exports = function () {
    return through.obj(function (file, enc, cb) {
        if (file.isNull()) {
            return cb(null, file);
        }

        if (file.isStream()) {
            this.emit('error', new gutil.PluginError('gulp-useref', 'Streaming not supported'));
            return cb();
        }

        var output = useref(file.contents.toString());
        var html = output[0];

        try {
            file.contents = new Buffer(html);
            this.push(file);
        } catch (err) {
            this.emit('error', new gutil.PluginError('gulp-useref', err));
        }

        cb();
    });
};

module.exports.assets = function (opts) {
    opts = opts || {};

    var braceExpandJoin = require('brace-expand-join'),
        concat = require('gulp-concat'),
        gulpif = require('gulp-if'),
        types = opts.types || ['css', 'js'],
        isRelativeUrl = require('is-relative-url'),
        vfs = require('vinyl-fs'),
        streams = Array.prototype.slice.call(arguments, 1),
        restoreStream = through.obj(),
        unprocessed = 0,
        end = false;

    var assets = through.obj(function (file, enc, cb) {
        var output = useref(file.contents.toString());
        var assets = output[1];

        types.forEach(function (type) {
            var files = assets[type];

            if (!files) {
                return;
            }

            Object.keys(files).forEach(function (name) {
                var src,
                    globs,
                    searchPaths,
                    filepaths = files[name].assets;

                if (!filepaths.length) {
                    return;
                }

                unprocessed++;

                if (files[name].searchPaths) {
                    searchPaths = braceExpandJoin(file.cwd, files[name].searchPaths);
                } else if (opts.searchPath) {
                    if (Array.isArray(opts.searchPath)) {
                        if (opts.searchPath.length > 1) {
                            searchPaths = '{' + opts.searchPath.join(',') + '}';
                        } else if (opts.searchPath.length === 1) {
                            searchPaths = opts.searchPath[0];
                        }
                    } else {
                        searchPaths = opts.searchPath;
                    }

                    searchPaths = braceExpandJoin(file.cwd, searchPaths);
                }

                if (!searchPaths) {
                    searchPaths = file.base;
                }

                globs = filepaths
                    .filter(isRelativeUrl)
                    .map(function (filepath) {
                        return braceExpandJoin(searchPaths, filepath);
                    });

                src = vfs.src(globs, {
                    base: file.base,
                    nosort: true,
                    nonull: true
                });

                streams.forEach(function (stream) {
                    src.pipe(stream);
                });

                src
                    .pipe(gulpif(!opts.noconcat, concat(name)))
                    .pipe(through.obj(function (newFile, enc, callback) {
                        this.push(newFile);
                        callback();
                    }.bind(this)))
                    .on('finish', function () {
                        if (--unprocessed === 0 && end) {
                            this.emit('end');
                        }
                    }.bind(this));

            }, this);

        }, this);

        restoreStream.write(file, cb);

    }, function () {
        end = true;
        if (unprocessed === 0) {
            this.emit('end');
        }
    });

    assets.restore = function () {
        return restoreStream.pipe(through.obj(), { end: false });
    };

    return assets;
};
