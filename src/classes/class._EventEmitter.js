export default class _EventEmitter {
    constructor() {
        this._events = {};
    }
    on(evt, listener) {
        (this._events[evt] || (this._events[evt] = [])).push(listener);
        return this;
    }
    emit(evt, arg) {
        console.log(evt);
        (this._events[evt] || []).slice().forEach(lsn => lsn(arg));
    }
}