'use strict';
const fs = require('fs');

// need to refactor with stream /async one
exports.isStaticReq = (publicPath, filePath) => {
    try {
        fs.statSync(`${publicPath}${filePath}`)
    } catch (e) {
        return false;
    }
    return true;
}
