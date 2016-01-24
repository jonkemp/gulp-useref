'use strict';
var through = require('through2'),
    streamManager = require('./lib/streamManager');

module.exports = function (options) {
    streamManager.transforms = Array.prototype.slice.call(arguments, 1);
    streamManager.options = options || {};

    streamManager.additionalStreams();

    return through.obj(streamManager.transformFunction, streamManager.flushFunction);
};
