'use strict';
const Rx = require('@reactivex/rxjs');

exports.ObservableObject = (obj, stream) => {
    return new Proxy(obj, {
        set: function (target, key, value, receiver) {
            // console.log(`key: ${key} \n target: ${JSON.stringify(target)} \n value: ${value} \n receiver: ${JSON.stringify(receiver)}`);
            if (key != 'length') {
                stream.next(Object.assign(target, { [key]: value }));
            }
            return Reflect.set(target, key, value, receiver);
        }
    });
}
