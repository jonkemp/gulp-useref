'use strict';

module.exports = function () {
    var _end;

    return {
        set: function (cb) {
            _end = cb;

            return _end;
        },

        fn: function () {
            return _end();
        }
    };
};
