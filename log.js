// log errors into file

// one log file each day

if (today.log) {
    log("error message");
} else {
    createLogFile(date);
    log("error message");
}