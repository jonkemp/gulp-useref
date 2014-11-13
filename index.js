'use strict';
var gutil = require('gulp-util'),
    through = require('through2'),
    useref = require('node-useref'),
    vfs = require('vinyl-fs'),
    concat = require('gulp-concat');

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
        braceExpandJoin = require('brace-expand-join'),
        glob = require('glob'),
        isAbsoluteUrl = require('is-absolute-url'),
        prepair = [],
        opts,
        types,
        restoreStream = through.obj(),
        unprocessed = 0,
        end = false;
    Array.prototype.push.apply(prepair, arguments);
    opts = prepair.shift() || {};
    types = opts.types || ['css', 'js'];

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
                    var filepaths = files[name].assets;

                    if (!filepaths.length) {
                        unprocessed --;
                    } else {
                        var searchPaths,
                            src = [];

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
                                filenames;

                            if (!isAbsoluteUrl(filepath)) {
                                pattern = braceExpandJoin((searchPaths || file.base), filepath);
                                filenames = glob.sync(pattern);
                                if (!filenames.length) {
                                    filenames.push(pattern);
                                }
                                src.push(filenames[0]);
                            }
                        }, this);
                        var self = this;
                        var stream = vfs.src(src, {base: file.base});
                        prepair.forEach(function(plugin) {
                            stream.pipe(plugin);
                        });

                        stream.pipe(concat(name)).pipe(through.obj(function (joinedFile, enc, callback) {
                            joinedFile.path = path.join(file.base, name);
                            joinedFile.cwd = file.cwd;
                            joinedFile.base = file.base;
                            self.push(joinedFile);
                            callback(null, joinedFile);
                        })).on('finish', function() {
                            if (--unprocessed == 0 && end) {
                                self.emit('end');
                            }
                        });
                    }
                }, this);
            }
        }, this);

        restoreStream.write(file, cb);
    }, function() {
        end = true;
        if (unprocessed == 0) {
            this.emit('end');
        }
    });

    assets.restore = function () {
        return restoreStream.pipe(through.obj(), { end: false });
    };

    return assets;
};

