'use strict';
var path = require('path'),
    gutil = require('gulp-util'),
    es = require('event-stream'),
    through = require('through2'),
    useref = require('useref'),
    getGlobs = require('./lib/getGlobs'),
    addFilesFromExtStreams = require('./lib/addFilesFromExtStreams'),
    addHtmlToStream = require('./lib/addHtmlToStream'),
    unprocessedCounter = require('./lib/unprocessedCounter')(),
    end = require('./lib/end')(),
    additionalFiles = [],
    transforms,
    pluginOptions;

function handleAdditionalStreams(additionalStreams) {
    var _additionalStreams = additionalStreams;

    if (!Array.isArray(additionalStreams)) {
        _additionalStreams = [ additionalStreams ];
    }

    return _additionalStreams.map(function (stream) {
        // filters stream to select needed files
        return stream.pipe(es.through(function (file) {
            additionalFiles.push(file);
        }));
    });
}

function addAssetsToStream(paths, files) {
    var self = this,
        gulpif = require('gulp-if'),
        concat = require('gulp-concat'),
        isRelativeUrl = require('is-relative-url'),
        vfs = require('vinyl-fs'),
        src,
        globs,
        name = paths.name,
        basePath = paths.basePath,
        filepaths = files[name].assets,
        options = pluginOptions,
        gulpConcatOptions = {};

    if (!filepaths.length) {
        return;
    }

    unprocessedCounter.increment();

    // Get relative file paths and join with search paths to send to vinyl-fs
    globs = filepaths
        .filter(isRelativeUrl)
        .map(function (filepath) {
            paths.filepath = filepath;

            return getGlobs(paths, files);
        });

    src = vfs.src(globs, {
        base: basePath,
        nosort: true
    })
    .on('error', function (err) {
        self.emit('error', new Error(err));
    });

    // add files from external streams
    src = addFilesFromExtStreams.call(self, additionalFiles, globs, src);

    // If any external transforms were included, pipe all files to them first
    transforms.forEach(function (fn) {
        src = src.pipe(fn(name));
    });

    // option for newLine in gulp-concat
    if (options.hasOwnProperty('newLine')) {
        gulpConcatOptions.newLine = options.newLine;
    }

    // Add assets to the stream
    // If noconcat option is false, concat the files first.
    src
        .pipe(gulpif(!options.noconcat, concat(name, gulpConcatOptions)))
        .pipe(through.obj(function (newFile, encoding, callback) {
            // specify an output path relative to the cwd
            if (options.base) {
                newFile.path = path.join(options.base, name);
                newFile.base = options.base;
            }

            // add file to the asset stream
            self.push(newFile);
            callback();
        }))
        .on('finish', function () {
            var unprocessed = unprocessedCounter.decrement();

            if (unprocessed === 0 && end.get()) {
                // end the asset stream
                end.fn();
            }
        });
}

function processAssets(file, basePath, data) {
    var self = this,
        types = pluginOptions.types || [ 'css', 'js' ];

    types.forEach(function (type) {
        var files = data[type],
            name;

        if (!files) {
            return;
        }

        for (name in files) {
            addAssetsToStream.call(self, {
                name: name,
                basePath: basePath,
                searchPath: pluginOptions.searchPath,
                cwd: file.cwd,
                transformPath: pluginOptions.transformPath
            }, files);
        }
    });
}

module.exports = function (options) {
    var opts = options || {},
        waitForAssets,
        additionalStreams;

    pluginOptions = opts;
    transforms = Array.prototype.slice.call(arguments, 1);

    // If any external streams were included, add matched files to src
    if (opts.additionalStreams) {
        additionalStreams = handleAdditionalStreams(opts.additionalStreams);

        // If we have additional streams, wait for them to run before continuing
        waitForAssets = es.merge(additionalStreams).pipe(through.obj());
    } else {
        // Else, create a fake stream
        waitForAssets = through.obj();
    }

    return through.obj(function (file, enc, cb) {
        var self = this;

        waitForAssets.pipe(es.wait(function () {
            var output,

                // Cache the file base path relative to the cwd
                // Use later when it could be dropped
                _basePath = path.dirname(file.path);

            if (file.isNull()) {
                return cb(null, file);
            }

            if (file.isStream()) {
                return cb(new gutil.PluginError('gulp-useref', 'Streaming not supported'));
            }

            output = useref(file.contents.toString(), opts);

            addHtmlToStream.call(self, file, output[0]);

            if (!opts.noAssets) {
                processAssets.call(self, file, _basePath, output[1]);
            }

            return cb();
        }));

        // If no external streams were included,
        // emit 'end' on the empty stream
        if (!additionalStreams) {
            waitForAssets.emit('end');
        }
    }, function (cb) {
        var unprocessed = unprocessedCounter.get(),
            fn = function () {};

        end.set(cb);

        if (unprocessed === 0) {
            fn = cb;
        }

        return fn();
    });
};
