'use strict';

const http = require('http');
const Rx = require('@reactivex/rxjs');
const router = require('./router');
const error$ = require('./errorHandler');
const request$ = new Rx.Subject();

//test with exception
router.addRouter("/user", "GET", function (req, res) {
    throw new Error("hahadeee");
    res.end("for /user");
})

router.addRouter("/main", "GET", function (req, res) {
    res.end("for /main");
})


//dynamic add router
//router with param
setTimeout(function () {
    router.addRouter("/new/:id", "GET", function (req, res) {
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
            return {
                router: {
                    handler: function () {
                    }
                },
                request: http.request, response: http.response
            }
        }
    })
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



//To-do
// get post put delete, different request method //quick fix
// parser queryString
// render static html