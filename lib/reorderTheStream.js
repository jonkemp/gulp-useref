'use strict';

var through = require('through2');

module.exports = function (globs, src) {
    var self = this,
        sortIndex = {},
        i = 0,
        sortedFiles = [],
        unsortedFiles = [];

    // Create a sort index so we don't iterate over the globs for every file
    globs.forEach(function (filename) {
        sortIndex[filename] = i++;
    });

    return src.pipe(through.obj(function (srcFile, encoding, callback) {
        var index = sortIndex[srcFile.path];

        if (index === undefined) {
            unsortedFiles.push(srcFile);
        } else {
            sortedFiles[index] = srcFile;
        }
        callback();
    }, function (callback) {
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
