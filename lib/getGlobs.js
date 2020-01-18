const getPattern = require('./getPattern');

module.exports = (paths, files) => {
    let pattern;
    let matches;
    const glob = require('glob');
    let searchPath = paths.searchPath;
    const name = paths.name;
    const cwd = paths.cwd;
    const basePath = paths.basePath;
    const filepath = paths.filepath;
    const transformPath = paths.transformPath;

    if (searchPath && Array.isArray(searchPath)) {
        searchPath = searchPath.length === 1 ? searchPath[0] : `{${searchPath.join(',')}}`;
    }

    pattern = getPattern(files, {
        destPath: name,
        searchPath,
        cwd,
        basePath,
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
