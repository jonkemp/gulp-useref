'use strict';

var gutil = require('gulp-util');

module.exports = function (file, data) {
    var self = this;

    try {
        file.contents = new Buffer(data);
        self.push(file);
    } catch (err) {
        self.emit('error', new gutil.PluginError('gulp-useref', err));
    }
};
