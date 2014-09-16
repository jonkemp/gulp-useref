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

module.exports.assets = function (options) {
    var path = require('path'),
        fs = require('fs'),
        braceExpandJoin = require('brace-expand-join'),
        glob = require('glob'),
        stripBom = require('strip-bom'),
        isAbsoluteUrl = require('is-absolute-url'),
        opts = options || {},
        types = opts.types || ['css', 'js'],
        restoreStream = through.obj();

    var assets = through.obj(function (file, enc, cb) {
        var output = useref(file.contents.toString());
        var assets = output[1];

        types.forEach(function (type) {
            var files = assets[type];
            if (files) {
                Object.keys(files).forEach(function (name) {
                    var buffer = [];
                    var filepaths = files[name].assets;

                    if (filepaths.length) {
                        var searchPaths,
                            joinedFile;

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
                                try {
                                    buffer.push(stripBom(fs.readFileSync(filenames[0])));
                                } catch (err) {
                                    this.emit('error', new gutil.PluginError('gulp-useref', err));
                                }
                            }
                        }, this);

                        if (buffer.length) {
                            joinedFile = new gutil.File({
                                cwd: file.cwd,
                                base: file.base,
                                path: path.join(file.base, name),
                                contents: new Buffer(buffer.join(gutil.linefeed))
                            });

                            this.push(joinedFile);
                        }
                    }

                }, this);
            }
        }, this);

        restoreStream.write(file, cb);
    });

    assets.restore = function () {
        return restoreStream.pipe(through.obj(), { end: false });
    };

    return assets;
};
