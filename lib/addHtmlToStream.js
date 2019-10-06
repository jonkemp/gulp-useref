'use strict';

var PluginError = require('plugin-error');

module.exports = function (file, data) {
    var self = this;

    try {
        file.contents = Buffer.from(data);
        self.push(file);
    } catch (err) {
        self.emit('error', new PluginError('gulp-useref', err));
    }
};
