'use strict';

const http = require('http');
const Rx = require('@reactivex/rxjs');
const router = require('./router');
const error$ = require('./errorHandler');
const staticModule = require('./static.js');
const utility = require('./utility.js');

const request$ = new Rx.Subject();

let publicPath;
staticModule.publicPath$.subscribe(x => {
    publicPath = x;
});



var a = [1, 2, 3, 54];

let stream = new Rx.Subject();
let xxx = utility.ObservableObject(a, stream);
stream.subscribe(x => console.log("stream", x));

xxx.splice(1, 2);
xxx.push(55);

staticModule.setPublic("./public");

//test with exception
router.addRouter("/user", "GET", function (req, res) {
    // throw new Error("hahadeee");
    //need to setHeader if you want to download a file
    res.setHeader('Content-disposition', 'attachment; filename=index.html');
    staticModule.render(`/index.html`, res);
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
    .partition((v) => staticModule.isStaticReq(v.request.url))


let staticReqeust$ = allRequest$[0];
let logicRequest$ = allRequest$[1];

staticReqeust$
    .map(x => { return { url: x.request.url, res: x.response } })
    .subscribe(
    x => {
        staticModule.render(x.url, x.res);
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
// send/receive file - error path for read files
// parser form data
// middleware support

