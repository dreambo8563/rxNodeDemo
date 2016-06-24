'use strict';
let path = require('path');
const Rx = require('@reactivex/rxjs');

let publicPath$ = new Rx.ReplaySubject(1);

// default publicPath
publicPath$.next(__dirname);

exports.setPublic = newPath => {
    if (path.isAbsolute(newPath)) {
        publicPath$.next(newPath);
    } else {
        publicPath$.next(path.resolve(newPath));
    }
}

exports.publicPath$ = publicPath$;
