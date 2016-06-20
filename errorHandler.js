'use strict';

let Rx = require('@reactivex/rxjs');
let error$ = new Rx.Subject();

error$.subscribe(obj => {
    switch (obj.type) {
        case 'REQUEST':
            console.log("log request error", obj.error);
            obj.response.end("request error");
            break;
        case 'RESPONSE':
            console.log("log response error", obj.error);
            obj.response.end("response error");
            break;
        case 'HANDLER':
            console.log("exception in your function", obj.error);
            obj.response.end("exception in your function");
            break;
        case 'ROUTE':
            console.log("route not matched");
            obj.response.end("route not matched");
            break;

        default:
            console.log("error on error stream no cases");
            obj.response.end("error on error stream no cases");
            break;
    }
});

module.exports = error$;