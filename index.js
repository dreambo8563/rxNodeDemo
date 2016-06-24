'use strict';

const http = require('http');
const fs = require('fs');
const Rx = require('@reactivex/rxjs');
const router = require('./router');
const error$ = require('./errorHandler');
const path = require('./path');
const staticRes = require('./static.js');

const request$ = new Rx.Subject();

path.setPublic("./public");
let publicPath = path.publicDirectory();

//test with exception
router.addRouter("/user", "GET", function (req, res) {
    // throw new Error("hahadeee");
         staticRes.render(`${publicPath}/index.html`, res);
})

router.addRouter("/main", "GET", function (req, res) {
    res.end("for /main", JSON.stringify(req.queryString));
})


//dynamic add router
//router with param
setTimeout(function () {
    router.addRouter("/new/:id", "GET", function (req, res) {
        res.end(`for /new param ${JSON.stringify(req.params)} and query ${JSON.stringify(req.queryString)}`);
    })
}, 5000);




let allRequest$ = request$
    .filter(http => http.request.url != "/favicon.ico")
    .partition((v, i) => staticRes.isStaticReq(publicPath, v.request.url))


let staticReqeust$ = allRequest$[0];
let logicRequest$ = allRequest$[1];

staticReqeust$
    .map(x => { return { url: `${publicPath}${x.request.url}`, res: x.response } })
    .subscribe(
    x => {
        staticRes.render(x.url, x.res);
        console.log(x.url);
    }
    );

logicRequest$
    .withLatestFrom(Rx.Observable.defer(() => Rx.Observable.of(router.routerArray)), (http, routers) => {
        let matchedRouter = routers.find((v, i) => router.routerMatch(v, http.request));
        if (!!matchedRouter) {
            return { router: matchedRouter, request: http.request, response: http.response };
        } else {
            error$.next({ error: null, response: http.response, type: "ROUTE" });
        }
    }).filter(x => !!x)
    .subscribe(routerHandler => {
        try {
            routerHandler.router.handler(routerHandler.request, routerHandler.response);
        } catch (error) {
            error$.next({ error: error, response: routerHandler.response, type: "HANDLER" });
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
// log errors into file
// send/receive file - error path for read files
