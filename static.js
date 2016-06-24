'use strict';
const fs = require('fs');
const publicPath$ = require('./path').publicPath$;

// need to refactor with stream /async one
// the way is tricky

let publicPath;
publicPath$.subscribe(x => {
    publicPath = x;
    console.log("public", x);
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