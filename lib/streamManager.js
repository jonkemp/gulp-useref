'use strict';

var exports = module.exports = (function () {
    var gutil = require('gulp-util'),
        through = require('through2'),
        useref = require('useref'),
        es = require('event-stream'),
        path = require('path'),
        isRelativeUrl = require('is-relative-url'),
        vfs = require('vinyl-fs'),
        getPattern = require('./getPattern'),
        addFilesFromExtStreams = require('./addFilesFromExtStreams'),
        addHtmlToStream = require('./addHtmlToStream'),
        additionalFiles = [],
        unprocessed = 0,
        end = false;

    return {
        options: {},

        transforms: null,

        getGlobs: function (file, paths, files) {
            var pattern,
                matches,
                glob = require('glob'),
                options = exports.options,
                searchPath = options.searchPath,
                name = paths.name,
                basePath = paths.basePath,
                filepath = paths.filepath;

            if (searchPath && Array.isArray(searchPath)) {
                searchPath = '{' + searchPath.join(',') + '}';
            }

            pattern = getPattern(files, {
                destPath: name,
                searchPath: searchPath,
                cwd: file.cwd,
                basePath: basePath,
                srcPath: filepath
            });

            matches = glob.sync(pattern, { nosort: true });

            if (!matches.length) {
                matches.push(pattern);
            }

            if (options.transformPath) {
                matches[0] = options.transformPath(matches[0]);
            }

            return matches[0];
        },

        addAssetsToStream: function (file, paths, files) {
            var self = this,
                gulpif = require('gulp-if'),
                concat = require('gulp-concat'),
                src,
                globs,
                name = paths.name,
                basePath = paths.basePath,
                filepaths = files[name].assets,
                options = exports.options;

            if (!filepaths.length) {
                return;
            }

            unprocessed++;

            // Get relative file paths and join with search paths to send to vinyl-fs
            globs = filepaths
                .filter(isRelativeUrl)
                .map(function (filepath) {
                    paths.filepath = filepath;

                    return exports.getGlobs(file, paths, files);
                });

            src = vfs.src(globs, {
                base: basePath,
                nosort: true
            });

            src.on('error', function (err) {
                self.emit('error', new Error(err));
            });

            // add files from external streams
            src = addFilesFromExtStreams.call(self, additionalFiles, globs, src);

            // If any external transforms were included, pipe all files to them first
            exports.transforms.forEach(function (fn) {
                src = src.pipe(fn(name));
            });

            // Add assets to the stream
            // If noconcat option is false, concat the files first.
            src
                .pipe(gulpif(!options.noconcat, concat(name)))
                .pipe(through.obj(function (newFile, encoding, callback) {
                    // specify an output path relative to the cwd
                    if (options.base) {
                        newFile.path = path.join(options.base, name);
                    }

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
        },

        processAssets: function (file, basePath, data) {
            var self = this,
                types = exports.options.types || [ 'css', 'js' ];

            types.forEach(function (type) {
                var files = data[type],
                    name;

                if (!files) {
                    return;
                }

                for (name in files) {
                    exports.addAssetsToStream.call(self, file, {
                        name: name,
                        basePath: basePath
                    }, files);
                }
            });
        },

        processFilesAndAssets: function (file, cb) {
            var self = this,
                output,
                options = exports.options,

                // Cache the file base path relative to the cwd
                // Use later when it could be dropped
                _basePath = path.dirname(file.path);

            if (file.isNull()) {
                return cb(null, file);
            }

            if (file.isStream()) {
                return cb(new gutil.PluginError('gulp-useref', 'Streaming not supported'));
            }

            output = useref(file.contents.toString(), options);

            addHtmlToStream.call(self, file, output[0]);

            if (!options.noAssets) {
                exports.processAssets.call(self, file, _basePath, output[1]);
            }

            cb();
        },

        transformFunction: function (file, enc, cb) {
            var self = this;

            exports.waitForAssets.pipe(es.wait(function () {
                exports.processFilesAndAssets.call(self, file, cb);
            }));
        },

        flushFunction: function () {
            end = true;
            if (unprocessed === 0) {
                this.emit('end');
            }
        },

        additionalStreams: function () {
            var options = exports.options;

            // If any external streams were included, add matched files to src
            if (options.additionalStreams) {
                if (!Array.isArray(options.additionalStreams)) {
                    options.additionalStreams = [ options.additionalStreams ];
                }

                options.additionalStreams = options.additionalStreams.map(function (stream) {
                    // filters stream to select needed files
                    return stream
                        .pipe(es.through(function (file) {
                            additionalFiles.push(file);
                        }));
                });
            }

            if (options.additionalStreams) {
                // If we have additional streams, wait for them to run before continuing
                exports.waitForAssets = es.merge(options.additionalStreams).pipe(through.obj());
            } else {
                // Else, create a fake stream
                exports.waitForAssets = through.obj();
                exports.waitForAssets.emit('finish');
            }
        }
    };
}());
