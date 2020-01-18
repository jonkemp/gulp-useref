module.exports = () => {
    let _end;

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
        get,
        set,
        fn
    };
};
