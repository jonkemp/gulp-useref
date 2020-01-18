const through = require('through2');

module.exports = function (globs, src) {
    const self = this;
    const sortIndex = {};
    let i = 0;
    const sortedFiles = [];
    const unsortedFiles = [];

    // Create a sort index so we don't iterate over the globs for every file
    globs.forEach(filename => {
        sortIndex[filename] = i++;
    });

    return src.pipe(through.obj((srcFile, encoding, callback) => {
        const index = sortIndex[srcFile.path];

        if (index === undefined) {
            unsortedFiles.push(srcFile);
        } else {
            sortedFiles[index] = srcFile;
        }
        callback();
    }, callback => {
        sortedFiles.forEach(function (sorted) {
            if (sorted !== undefined) {
                this.push(sorted);
            }
        }, self);

        unsortedFiles.forEach(function (unsorted) {
            this.push(unsorted);
        }, self);
        callback();
    }));
};
