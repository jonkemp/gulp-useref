var map = require('map-stream');
var gutil = require('gulp-util');
var useref = require('useref');

module.exports = function(){
    return map(function (file, cb){
        if (file.isNull()) {
            return cb(null, file);
        }

        if (file.isStream()) {
            return cb(new Error('gulp-useref: Streaming not supported'));
        }

        file.contents = new Buffer(useref(file.contents.toString())[0]);

        cb(null, file);
    });
};