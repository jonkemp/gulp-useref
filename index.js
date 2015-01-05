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
        isRelativeUrl = require('is-relative-url'),
        vfs = require('vinyl-fs'),
        streams = Array.prototype.slice.call(arguments, 1),
        restoreStream = through.obj(),
        unprocessed = 0,
        end = false;

    var assets = through.obj(function (file, enc, cb) {
        var assetMap = useref(file.contents.toString())[1];

        (opts.types || ['css', 'js']).forEach(function (type) {
            var files = assetMap[type];
            if (!files) {
                return;
            }

            Object.keys(files).forEach(function (name) {
                var filepaths = files[name].assets;

                if (!filepaths.length) {
                    return;
                }

                var src,
                    searchPaths;

                unprocessed++;

                if (files[name].searchPaths) {
                    searchPaths = braceExpandJoin(file.cwd, files[name].searchPaths);
                } else if (opts.searchPath) {
                    if (Array.isArray(opts.searchPath)) {
                        searchPaths = '{' + opts.searchPath.join(',') + '}';
                    } else {
                        searchPaths = opts.searchPath;
                    }

                    searchPaths = braceExpandJoin(file.cwd, searchPaths);
                }

                if (!searchPaths) {
                    searchPaths = file.base;
                }

                src = vfs.src(filepaths.filter(isRelativeUrl).map(function (filepath) {
                    return braceExpandJoin(searchPaths, filepath);
                }), {
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
                        assets.push(newFile);
                        callback();
                    }))
                    .on('finish', function () {
                        if (--unprocessed === 0 && end) {
                            assets.emit('end');
                        }
                    });
            });
        });

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
