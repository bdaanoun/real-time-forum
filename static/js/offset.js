export const offset = {
    value: 0,
    increase(by = 10) {
        this.value += by;
    },
    get() {
        return this.value;
    },
    reset() {
        this.value = 0;
    }
};