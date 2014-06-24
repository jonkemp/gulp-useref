'use strict';
var gutil = require('gulp-util');
var through = require('through2');
var useref = require('node-useref');
var path = require('path');
var fs = require('fs');
var glob = require('glob');

var restoreStream = through.obj();

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

module.exports.assets = function (options) {
    var opts = options || {};
    var types = opts.types || ['css', 'js'];

    return through.obj(function (file, enc, cb) {
        var output = useref(file.contents.toString());
        var assets = output[1];

        types.forEach(function (type) {
            var files = assets[type];
            if (files) {
                Object.keys(files).forEach(function (name) {
                    var buffer = [];
                    var filepaths = files[name].assets;

                    if (filepaths.length) {
                        var searchPaths;
                        if (files[name].searchPaths) {
                            searchPaths = path.join(file.cwd, files[name].searchPaths);
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

                            searchPaths = path.join(file.cwd, searchPaths);
                        }

                        filepaths.forEach(function (filepath) {
                            var pattern = path.join((searchPaths || file.base), filepath);
                            var filenames = glob.sync(pattern);
                            if (!filenames.length) {
                                filenames.push(pattern);
                            }
                            try {
                                buffer.push(fs.readFileSync(filenames[0]));
                            } catch (err) {
                                if (err.code === 'ENOENT') {
                                    this.emit('error', 'gulp-useref: no such file or directory \'' + pattern + '\'');
                                } else {
                                    this.emit('error', new gutil.PluginError('gulp-useref', err));
                                }
                            }
                        }, this);

                        var joinedFile = new gutil.File({
                            cwd: file.cwd,
                            base: file.base,
                            path: path.join(file.base, name),
                            contents: new Buffer(buffer.join(gutil.linefeed))
                        });

                        this.push(joinedFile);
                    }

                }, this);
            }
        }, this);

        restoreStream.write(file, cb);
    });
};

module.exports.restore = function () {
    return restoreStream.pipe(through.obj(), { end: false });
};
