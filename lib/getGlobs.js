'use strict';

var getPattern = require('./getPattern');

module.exports = function (paths, files) {
    var pattern,
        matches,
        glob = require('glob'),
        searchPath = paths.searchPath,
        name = paths.name,
        cwd = paths.cwd,
        basePath = paths.basePath,
        filepath = paths.filepath,
        transformPath = paths.transformPath;

    if (searchPath && Array.isArray(searchPath)) {
        searchPath = searchPath.length === 1 ? searchPath[0] : '{' + searchPath.join(',') + '}';
    }

    pattern = getPattern(files, {
        destPath: name,
        searchPath: searchPath,
        cwd: cwd,
        basePath: basePath,
        srcPath: filepath
    });

    matches = glob.sync(pattern, { nosort: true });

    if (!matches.length) {
        matches.push(pattern);
    }

    if (transformPath) {
        matches[0] = transformPath(matches[0]);
    }

    return matches[0];
};
