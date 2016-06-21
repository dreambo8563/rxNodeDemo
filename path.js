'use strict';
let path = require('path');

let publicPath = __dirname;

exports.setPublic = newPath => {
    if (path.isAbsolute(newPath)) {
        publicPath = newPath;
    } else {
        publicPath = path.resolve(newPath);
    }
}

exports.publicDirectory = () => publicPath;