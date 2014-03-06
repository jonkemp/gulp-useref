var gutil = require('gulp-util');
var through = require('through');
var useref = require('useref');
var fs = require('fs');
var path = require('path');

module.exports = function(opts) {
    var referencesQueue = [];
    var referencesStream = through(function(file) {});
    var searchPaths = (opts || {}).search || [];

    // Enqueue a set of reference to be passed through to the reference stream. This will queue references if the
    // references stream has not yet been accessed. Once accessed, the queue will be emptied, and items passing through
    // this function will be pushed to the stream without being queued first. This allows the plugin to skip reading of
    // the references unless required. It also prevents any error messages (about missing files) from being emitted
    // unless the user is interested in the referenced files.
    var enqueueReferences = function(userefReferences) {
        if (referencesQueue) { referencesQueue.push(userefReferences); }
        else {
            ['css', 'js'].forEach(function(groupName) {
                var group = userefReferences[groupName];
                if (group) {
                    Object.keys(group).forEach(function (outputName) {
                        var file = userefReferences.file;
                        var filepaths = group[outputName];
                        var buffer = [];
                        filepaths.forEach(function (relative) {
                            var found = false;
                            var search = searchPaths
                                .map(function(base) { return path.join(file.cwd, base); })
                                .concat([file.base]);
                            search.forEach(function(base) {
                                var filepath = path.join(base, relative);
                                try {
                                    buffer.push(fs.readFileSync(filepath));
                                    found = true;
                                }
                                catch (err) {
                                    if (err.code == 'ENOENT' && err.syscall == 'open' && err.path) { } // ignore
                                    else {
                                        referencesStream.emit('error', new gutil.PluginError('gulp-useref', err));
                                    }
                                }
                                return !found; // break when found
                            });
                            if (!found) {
                                var warning = 'Missing file ' + relative + ' (not in ' + search.join(', ') + ')';
                                if (referencesStream.listeners('warning').length > 0) {
                                    referencesStream.emit('warning', warning);
                                }
                                else { gutil.log('[useref] ' + gutil.colors.red('Warning: ' + warning)); }
                            }
                        });
                        var joinedAsset = new gutil.File({
                            cwd: file.cwd,
                            base: file.base,
                            path: path.join(file.base, outputName),
                            contents: new Buffer(buffer.join(gutil.linefeed))
                        });
                        referencesStream.queue(joinedAsset);
                    });
                }
            });
        }
    };

    var stream = through(function(file) {
        if (file.isNull()) return this.queue(file); // pass along
        if (file.isStream()) return this.emit('error', new gutil.PluginError('gulp-useref', 'Streaming not supported'));

        var result;
        try { result = useref(file.contents.toString('utf8'), { encoding: 'utf-8'}); }
        catch (err) { this.emit('error', new gutil.PluginError('gulp-useref', err)); }
        var userefHTML = result[0];
        var userefReferences = result[1];
        file.contents = new Buffer(userefHTML);
        userefReferences.file = file; // save file for later use
        enqueueReferences(userefReferences);
        this.queue(file);
    });

    stream.references = function() {
        if (referencesQueue) {
            referencesQueue.forEach(enqueueReferences);
            referencesQueue = null;
        }
        return referencesStream;
    };

    stream.on('end', referencesStream.end.bind(referencesStream));

    return stream;
};
