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
    if (route.method == request.method) {
        let result = route.path.exec(request.url);
        if (!result) {
            return false;
        } else {
            request.params = {};
            route.params.map((v, i) => {
                request.params[v] = result[i + 1];
            })
            return true;
        }
    } else {
        return false;
    }

}

exports.routerArray = routerArray;