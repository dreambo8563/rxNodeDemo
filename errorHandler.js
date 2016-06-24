'use strict';

let Rx = require('@reactivex/rxjs');
const log$ = require('./log.js');
let error$ = new Rx.Subject();

error$.subscribe(obj => {
    switch (obj.type) {
        case 'REQUEST':
            log$.next(`request error ${obj.error}`);
            obj.response.end("request error");
            break;
        case 'RESPONSE':
            log$.next(`log response error ${obj.error}`);
            obj.response.end("response error");
            break;
        case 'HANDLER':
            log$.next(`exception in your function ${obj.error}`);
            obj.response.end("exception in your function");
            break;
        case 'ROUTE':
            log$.next("route not matched");
            obj.response.end("route not matched");
            break;

        default:
            log$.next("error on error stream no cases");
            obj.response.end("error on error stream no cases");
            break;
    }
});

module.exports = error$;