'use strict';
var gutil = require('gulp-util'),
    through = require('through2'),
    useref = require('node-useref');

module.exports = function () {
    return through.obj(function (file, enc, cb) {
        if (file.isStream()) {
            this.emit('error', new gutil.PluginError('gulp-useref', 'Streaming not supported'));
            return cb();
        }

        var output = useref(file.contents.toString());
        var html = output[0];

        try {
            file.contents = new Buffer(html);
        } catch (err) {
            this.emit('error', new gutil.PluginError('gulp-useref', err));
        }

        this.push(file);

        cb();
    });
};

module.exports.assets = function () {
    var path = require('path'),
        vfs = require('vinyl-fs'),
        concat = require('gulp-concat'),
        gulpif = require('gulp-if'),
        braceExpandJoin = require('brace-expand-join'),
        glob = require('glob'),
        isAbsoluteUrl = require('is-absolute-url'),
        args = Array.prototype.slice.call(arguments),
        opts = args[0] || {},
        streams = args.slice(1),
        types = opts.types || ['css', 'js'],
        restoreStream = through.obj(),
        unprocessed = 0,
        end = false;

    var assets = through.obj(function (file, enc, cb) {
        var output = useref(file.contents.toString());
        var assets = output[1];

        types.forEach(function (type) {
            var files = assets[type];
            if (files) {
                unprocessed += Object.keys(files).length;
            }
        });

        types.forEach(function (type) {
            var files = assets[type];
            if (files) {
                Object.keys(files).forEach(function (name) {
                    var src,
                        filepaths = files[name].assets;

                    if (!filepaths.length) {
                        unprocessed--;
                    } else {
                        var searchPaths,
                            filenames = [];

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

                        filepaths.forEach(function (filepath) {
                            var pattern,
                                matches;

                            if (!isAbsoluteUrl(filepath)) {
                                pattern = braceExpandJoin((searchPaths || file.base), filepath);
                                matches = glob.sync(pattern, { nosort: true });
                                if (!matches.length) {
                                    matches.push(pattern);
                                }
                                filenames.push(matches[0]);
                            }
                        }, this);

                        src = vfs.src(filenames, { base: file.base });

                        streams.forEach(function (stream) {
                            src.pipe(stream);
                        });

                        src
                            .pipe(gulpif(!opts.noconcat, concat(name)))
                            .pipe(through.obj(function (newFile, enc, callback) {

                                this.push(newFile);

                                callback(null, newFile);
                            }.bind(this)))
                            .on('finish', function () {
                                if (--unprocessed === 0 && end) {
                                    this.emit('end');
                                }
                            }.bind(this));
                    }
                }, this);
            }
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
