'use strict';


// To-Do
// refactor router

let http = require('http');
let Rx = require('@reactivex/rxjs');
let router = require('./router');

console.log(router);

let request$ = new Rx.Subject();


let error$ = new Rx.Subject();
// let log$ = new Rx.Subject();

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





router.addRouter("/user", function (req, res) {
    throw new Error("hahadeee");
    res.end("for /user");
})

router.addRouter("/main", function (req, res) {
    res.end("for /main");
})


//dynamic add router
setTimeout(function () {
    router.addRouter("/new/:id", function (req, res) {
        res.end(`for /new param ${JSON.stringify(req.params)}`);
    })
}, 5000);



request$
    .filter(http => http.request.url != "/favicon.ico")
    .withLatestFrom(Rx.Observable.defer(() => Rx.Observable.of(router.routerArray)), (http, routers) => {
        let matchedRouter = routers.find((v, i) => router.routerMatch(v, http.request));
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
    let body = [];
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
