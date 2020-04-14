var miniConsole = {
    log() {
        console.log(Array.prototype.join.call(arguments));
    }
}