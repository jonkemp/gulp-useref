module.exports = () => {
    let unprocessed = 0;

    return {
        get() {
            return unprocessed;
        },

        increment() {
            return unprocessed++;
        },

        decrement() {
            return --unprocessed;
        }
    };
};
