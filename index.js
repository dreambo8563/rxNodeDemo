'use strict';


// To-Do
// refactor router

var http = require('http');
var Rx = require('@reactivex/rxjs');

var request$ = new Rx.Subject();


var error$ = new Rx.Subject();
// var log$ = new Rx.Subject();

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

var routerArray = [];

function addRouter(path, handler) {
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

    routerArray.push({ path: regEx, handler: handler, params: params });
}

addRouter("/user", function (req, res) {
    throw new Error("hahadeee");
    res.end("for /user");
})

addRouter("/main", function (req, res) {
    res.end("for /main");
})


//dynamic add router
setTimeout(function () {
    addRouter("/new/:id", function (req, res) {
        res.end(`for /new param ${JSON.stringify(req.params)}`);
    })
}, 5000);

function routerMatch(route, request) {
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
}

request$
    .filter(http => http.request.url != "/favicon.ico")
    .withLatestFrom(Rx.Observable.defer(() => Rx.Observable.of(routerArray)), (http, routers) => {
        let matchedRouter = routers.find((v, i) => routerMatch(v, http.request));
        if (!!matchedRouter) {
            return { router: matchedRouter, request: http.request, response: http.response };
        } else {
            error$.next({ error: null, response: http.response, type: "ROUTE" })
        }
    }).filter(x => !!x)
    .subscribe(routerHandler => {
        try {
            routerHandler.router.handler(routerHandler.request, routerHandler.response);
        } catch (error) {
            error$.next({ error: error, response: routerHandler.response, type: "HANDLER" })
        }
    },
    () => { },
    () => { }
    );


http.createServer(function (request, response) {
    var body = [];
    request.on('error', function (error) {
        error$.next({ error: error, response: response, type: "REQUEST" })
    }).on('data', function (chunk) {
        body.push(chunk);
    }).on('end', function () {
        body = Buffer.concat(body).toString();
        this.body = body;
        response.on('error', function (error) {
            error$.next({ error: error, response: response, type: "RESPONSE" })
        });
        request$.next({ request: this, response: response });
    });
}).listen(8000); 
