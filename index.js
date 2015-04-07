'use strict';
var gutil = require('gulp-util'),
    through = require('through2'),
    useref = require('node-useref'),
    path = require('path');

function getSearchPaths(cwd, searchPath, filepath) {
    // Check for multiple search paths within the array
    if (searchPath.indexOf(',') !== -1) {
        return searchPath.split(',').map(function (nestedSearchPath) {
            return path.join(cwd, nestedSearchPath, filepath);
        });
    } else {
        return path.join(cwd, searchPath, filepath);
    }
}

module.exports = function () {
    return through.obj(function (file, enc, cb) {
        if (file.isNull()) {
            cb(null, file);
            return;
        }

        if (file.isStream()) {
            cb(new gutil.PluginError('gulp-useref', 'Streaming not supported'));
            return;
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

    var expand = require('brace-expansion'),
        _ = require('lodash'),
        concat = require('gulp-concat'),
        gulpif = require('gulp-if'),
        types = opts.types || ['css', 'js'],
        isRelativeUrl = require('is-relative-url'),
        vfs = require('vinyl-fs'),
        streams = Array.prototype.slice.call(arguments, 1),
        restoreStream = through.obj(),
        unprocessed = 0,
        end = false;

    var assetStream = through.obj(function (file, enc, cb) {
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

                searchPaths = files[name].searchPaths || opts.searchPath;

                // If searchPaths is not an array, use brace-expansion to expand it into an array
                if (!Array.isArray(searchPaths)) {
                    searchPaths = expand(searchPaths);
                }

                // Get relative file paths and join with search paths to send to vinyl-fs
                globs = filepaths
                    .filter(isRelativeUrl)
                    .map(function (filepath) {
                        if (searchPaths.length) {
                            return searchPaths.map(function (searchPath) {
                                return getSearchPaths(file.cwd, searchPath, filepath);
                            });
                        } else {
                            return path.join(file.base, filepath);
                        }
                    });

                // Flatten nested array before giving it to vinyl-fs
                src = vfs.src(_.flatten(globs, true), {
                    base: file.base,
                    nosort: true,
                    nonull: true
                });

                // If any external streams were included, pipe all files to them first
                streams.forEach(function (stream) {
                    src.pipe(stream());
                });

                // Add assets to the stream
                // If noconcat option is false, concat the files first.
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

    assetStream.restore = function () {
        return restoreStream.pipe(through.obj(), { end: false });
    };

    return assetStream;
};
