'use strict';
const fs = require('fs');

// need to refactor with stream /async one
// the way is tricky
exports.isStaticReq = (publicPath, filePath) => {
    try {
        fs.statSync(`${publicPath}${filePath}`)
    } catch (e) {
        return false;
    }
    return true;
}


exports.render = (path, res) => {
    const r = fs.createReadStream(path);
    r.pipe(res);
}