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

    return through.obj(function (file, enc, cb) {
        var output = useref(file.contents.toString());
        var assets = output[1];

        ['css', 'js'].forEach(function (type) {
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
                                searchPaths = '{' + opts.searchPath.join(',') + '}';
                            } else {
                                searchPaths = opts.searchPath;
                            }

                            searchPaths = path.join(file.cwd, searchPaths);
                        }

                        filepaths.forEach(function (filepath) {
                            filepath = path.join((searchPaths || file.base), filepath);
                            var foundPath = glob.sync(filepath);
                            if( foundPath.length == 0 ){
                              this.emit('error', new gutil.PluginError('gulp-useref', 'Unable to find any file with pattern \'' + filepath + '\'.'));
                            } else {
                              try {
                                  buffer.push(fs.readFileSync(foundPath[0]));
                              } catch (err) {
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
