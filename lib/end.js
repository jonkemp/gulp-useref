'use strict';

module.exports = function () {
    var _end;

    function get() {
        return _end;
    }

    function set(cb) {
        _end = cb;

        return _end;
    }

    function fn() {
        return _end();
    }

    return {
        get: get,
        set: set,
        fn: fn
    };
};
