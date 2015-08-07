'use strict';
var gutil = require('gulp-util'),
    through = require('through2'),
    useref = require('node-useref'),
    path = require('path'),
    multimatch = require('multimatch');

function getSearchPaths(cwd, searchPath, filepath) {
    // Assuming all paths are relative, strip off leading slashes
    filepath = filepath.replace(/^\/+/, '');

    // Check for multiple search paths within the array
    if (searchPath.indexOf(',') !== -1) {
        return searchPath.split(',').map(function (nestedSearchPath) {
            return path.resolve(cwd, nestedSearchPath, filepath);
        });
    } else {
        return path.resolve(cwd, searchPath, filepath);
    }
}

module.exports = function (opts) {
    return through.obj(function (file, enc, cb) {
        if (file.isNull()) {
            cb(null, file);
            return;
        }

        if (file.isStream()) {
            cb(new gutil.PluginError('gulp-useref', 'Streaming not supported'));
            return;
        }

        var output = useref(file.contents.toString(), opts);
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
        es = require('event-stream'),
        types = opts.types || ['css', 'js'],
        isRelativeUrl = require('is-relative-url'),
        vfs = require('vinyl-fs'),
        transforms = Array.prototype.slice.call(arguments, 1),
        restoreStream = through.obj(),
        unprocessed = 0,
        end = false,
        additionalFiles = [],
        waitForAssets;

    // If any external streams were included, add matched files to src
    if (opts.additionalStreams) {
        if (!Array.isArray(opts.additionalStreams)) {
            opts.additionalStreams = [opts.additionalStreams];
        }

        opts.additionalStreams = opts.additionalStreams.map(function (stream) {
            // filters stream to select needed files
            return stream
                .pipe(es.through(function (file) {
                    additionalFiles.push(file);
                }));
        });
    }

    if (opts.additionalStreams) {
        // If we have additional streams, wait for them to run before continuing
        waitForAssets = es.merge(opts.additionalStreams).pipe(through.obj());
    } else {
        // Else, create a fake stream
        waitForAssets = through.obj();
        waitForAssets.emit('finish');
    }

    var assetStream = through.obj(function (file, enc, cb) {
        var self = this;

        waitForAssets.pipe(es.wait(function () {
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
                            if (opts.transformPath) {
                                filepath = opts.transformPath(filepath);
                            }
                            if (searchPaths.length) {
                                return searchPaths.map(function (searchPath) {
                                    return getSearchPaths(file.cwd, searchPath, filepath);
                                });
                            } else {
                                return path.join(file.base, filepath);
                            }
                        });

                    // Flatten nested array before giving it to vinyl-fs
                    globs = _.flatten(globs, true);
                    src = vfs.src(globs, {
                        base: file.base,
                        nosort: true,
                        nonull: true
                    });

                    // add files from external streams
                    additionalFiles.forEach(function (file) {
                        // check if file should be included
                        if (multimatch(file.path, globs).length > 0) {
                            src.push(file);
                        }
                    });

                    // if we added additional files, reorder the stream
                    if (additionalFiles.length > 0) {
                        var sortIndex = {},
                            i = 0,
                            sortedFiles = [],
                            unsortedFiles = [];

                        // Create a sort index so we don't iterate over the globs for every file
                        globs.forEach(function (glob) {
                            sortIndex[glob] = i++;
                        });

                        src = src.pipe(through.obj(function (file, enc, cb) {
                            var index = sortIndex[file.path];

                            if (index === undefined) {
                                unsortedFiles.push(file);
                            } else {
                                sortedFiles[index] = file;
                            }
                            cb();
                        }, function (cb) {
                            sortedFiles.forEach(function (file) {
                                if (file !== undefined) {
                                    this.push(file);
                                }
                            }, this);

                            unsortedFiles.forEach(function (file) {
                                this.push(file);
                            }, this);
                            cb();
                        }));
                    }

                    // If any external transforms were included, pipe all files to them first
                    transforms.forEach(function (fn) {
                        src = src.pipe(fn(name));
                    });

                    // Add assets to the stream
                    // If noconcat option is false, concat the files first.
                    src
                        .pipe(gulpif(!opts.noconcat, concat(name)))
                        .pipe(through.obj(function (newFile, enc, callback) {
                            // add file to the asset stream
                            self.push(newFile);
                            callback();
                        }))
                        .on('finish', function () {
                            if (--unprocessed === 0 && end) {
                                // end the asset stream
                                self.emit('end');
                            }
                        });

                });

            });

            restoreStream.write(file, cb);
        }));
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
