'use strict';

module.exports = function () {
    var unprocessed = 0;

    return {
        get: function () {
            return unprocessed;
        },

        increment: function () {
            return unprocessed++;
        },

        decrement: function () {
            return --unprocessed;
        }
    };
};
