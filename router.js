'use strict';


let routerArray = [];

exports.addRouter = (path, method, handler) => {
    let urlSegments = path.split("/");
    let params = [];
    let regStr = urlSegments.map(x => {
        if (x.startsWith(':')) {
            params.push(x.slice(1));
            return '(\\w+)';
        } else {
            return x;
        }
    }).join("\\/");

    let regEx = new RegExp(`^${regStr}$`);

    routerArray.push({ path: regEx, method: method, handler: handler, params: params });
}

exports.routerMatch = (route, request) => {
    //check if request is the static resouces

    if (route.method == request.method) {
        let result = route.path.exec(parserQueryStirng(request));
        if (!!result) {
            request.params = {};
            route.params.map((v, i) => {
                request.params[v] = result[i + 1];
            })
            return true;
        }
    }
    return false;
}

function parserQueryStirng(request) {
    let queryArr = request.url.split('?');
    if (queryArr.length > 1) {
        request.queryString = {};
        queryArr[1].split('&').map(query => {
            let pair = query.split('=');
            request.queryString[pair[0]] = pair[1];
        })
    }

    return queryArr[0];
}

exports.routerArray = routerArray;