'use strict';

var reorderTheStream = require('./reorderTheStream');

module.exports = function (additionalFiles, globs, src) {
    var self = this,
        source;

    additionalFiles.forEach(function (addFile) {
        src.push(addFile);
    });

    // if we added additional files, reorder the stream
    if (additionalFiles.length > 0) {
        source = reorderTheStream.call(self, globs, src);
    }

    return source || src;
};
