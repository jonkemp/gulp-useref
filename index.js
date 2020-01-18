const path = require('path');
const PluginError = require('plugin-error');
const es = require('event-stream');
const through = require('through2');
const useref = require('useref');
const getGlobs = require('./lib/getGlobs');
const addFilesFromExtStreams = require('./lib/addFilesFromExtStreams');
const addHtmlToStream = require('./lib/addHtmlToStream');
const unprocessedCounter = require('./lib/unprocessedCounter')();
const end = require('./lib/end')();
const additionalFiles = [];
let transforms;
let pluginOptions;

function handleAdditionalStreams(additionalStreams) {
    let _additionalStreams = additionalStreams;

    if (!Array.isArray(additionalStreams)) {
        _additionalStreams = [ additionalStreams ];
    }

    // filters stream to select needed files
    return _additionalStreams.map(stream => stream.pipe(es.through(file => {
        additionalFiles.push(file);
    })));
}

function addAssetsToStream(paths, files) {
    const self = this;
    const gulpif = require('gulp-if');
    const concat = require('gulp-concat');
    const vfs = require('vinyl-fs');
    const extend = require('extend');
    let src;
    let globs;
    const name = paths.name;
    const basePath = paths.basePath;
    const filepaths = files[name].assets;
    const type = paths.type;
    const options = extend({}, pluginOptions);
    const gulpConcatOptions = {};

    if (!filepaths.length) {
        return;
    }

    unprocessedCounter.increment();

    // Get relative file paths and join with search paths to send to vinyl-fs
    globs = filepaths
        .filter(url => !/^(?:\w+:)?\/\//.test(url)) // test if url is relative
        .map(filepath => {
            paths.filepath = filepath;

            return getGlobs(paths, files);
        });

    src = vfs.src(globs, {
        base: basePath,
        nosort: true
    })
        .on('error', err => {
            self.emit('error', new Error(err));
        });

    // add files from external streams
    src = addFilesFromExtStreams.call(self, additionalFiles, globs, src);

    // If any external transforms were included, pipe all files to them first
    transforms.forEach(fn => {
        src = src.pipe(fn(name));
    });

    // option for newLine in gulp-concat
    if (Object.prototype.hasOwnProperty.call(options, 'newLine')) {
        if (options.newLine === ';' && type === 'css') {
            options.newLine = null;
        }
        gulpConcatOptions.newLine = options.newLine;
    }

    // Add assets to the stream
    // If noconcat option is false, concat the files first.
    src
        .pipe(gulpif(!options.noconcat, concat(name, gulpConcatOptions)))
        .pipe(through.obj((newFile, encoding, callback) => {
            // specify an output path relative to the cwd
            if (options.base) {
                newFile.path = path.join(options.base, name);
                newFile.base = options.base;
            }

            // add file to the asset stream
            self.push(newFile);
            callback();
        }))
        .on('finish', () => {
            const unprocessed = unprocessedCounter.decrement();

            if (unprocessed === 0 && end.get()) {
                // end the asset stream
                end.fn();
            }
        });
}

function processAssets({ cwd }, basePath, data) {
    const self = this;
    const types = pluginOptions.types || [ 'css', 'js' ];

    types.forEach(type => {
        const files = data[type];
        let name;

        if (!files) {
            return;
        }

        for (name in files) {
            addAssetsToStream.call(self, {
                name,
                basePath,
                searchPath: pluginOptions.searchPath,
                cwd,
                transformPath: pluginOptions.transformPath,
                type
            }, files);
        }
    });
}

module.exports = function (options) {
    const opts = options || {};
    let waitForAssets;
    let additionalStreams;

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
        const self = this;

        waitForAssets.pipe(es.wait(() => {
            let output;

            // Cache the file base path relative to the cwd
            // Use later when it could be dropped
            const _basePath = path.dirname(file.path);

            if (file.isNull()) {
                return cb(null, file);
            }

            if (file.isStream()) {
                return cb(new PluginError('gulp-useref', 'Streaming not supported'));
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
    }, cb => {
        const unprocessed = unprocessedCounter.get();
        let fn = () => {};

        end.set(cb);

        if (unprocessed === 0) {
            fn = cb;
        }

        return fn();
    });
};
