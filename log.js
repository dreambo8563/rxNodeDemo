'use strict';
const Rx = require('@reactivex/rxjs');
const fs = require('fs');

// one log file each day

let log$ = new Rx.Subject();


log$.subscribe(msg => {
    let stream = fs.createWriteStream(`${__dirname}/error.txt`, { 'flags': 'a' });
    stream.write(`${msg} date:${Date()} \n`);
    stream.end();
})




// if (today.log) {
//     log("error message");
// } else {
//     createLogFile(date);
//     log("error message");
// }


module.exports = log$;