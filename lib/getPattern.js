'use strict';

var path = require('path');

module.exports = function (files, paths) {
    var searchPaths,
        destPath = paths.destPath,
        searchPath = paths.searchPath,
        cwd = paths.cwd,
        basePath = paths.basePath,
        srcPath = paths.srcPath;

    if (files[destPath].searchPaths || searchPath) {
        searchPaths = path.resolve(cwd, files[destPath].searchPaths || searchPath);
    }
    return (searchPaths || basePath) + path.sep + srcPath;
};
