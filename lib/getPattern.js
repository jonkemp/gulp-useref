const path = require('path');

module.exports = (files, paths) => {
    let searchPaths;
    const destPath = paths.destPath;
    const searchPath = paths.searchPath;
    const cwd = paths.cwd;
    const basePath = paths.basePath;
    const srcPath = paths.srcPath;

    if (files[destPath].searchPaths || searchPath) {
        searchPaths = path.resolve(cwd, files[destPath].searchPaths || searchPath);
    }
    return (searchPaths || basePath) + path.sep + srcPath;
};
