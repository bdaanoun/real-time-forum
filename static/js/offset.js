class Offset {
    constructor() {
        this.value = 0;
    }

    increase(by = 10) {
        this.value += by;
    }

    get() {
        return this.value;
    }

    reset() {
        this.value = 0;
    }
}
export let offset = new Offset();
export let MsgsOffset = new Offset();