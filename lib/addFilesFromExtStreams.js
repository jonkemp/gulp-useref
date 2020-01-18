const reorderTheStream = require('./reorderTheStream');

module.exports = function (additionalFiles, globs, src) {
    const self = this;
    let source;

    additionalFiles.forEach(addFile => {
        src.push(addFile);
    });

    // if we added additional files, reorder the stream
    if (additionalFiles.length > 0) {
        source = reorderTheStream.call(self, globs, src);
    }

    return source || src;
};
