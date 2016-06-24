'use strict';
const fs = require('fs');

// need to refactor with stream /async one
// the way is tricky
let path = require('path');
const Rx = require('@reactivex/rxjs');

let publicPath$ = new Rx.ReplaySubject(1);
let publicPath;

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


publicPath$.subscribe(x => {
    publicPath = x;
});

exports.isStaticReq = (filePath) => {
    try {
        fs.statSync(`${publicPath}${filePath}`)
    } catch (e) {
        return false;
    }
    return true;
}


exports.render = (path, res) => {
    const r = fs.createReadStream((`${publicPath}${path}`));
    r.pipe(res);
}