module.exports = { enableLogging, disableLogging, log };

let loggingEnabled = true;

function enableLogging() {
    loggingEnabled = true;
}

function disableLogging() {
    loggingEnabled = false;
}

function log(message) {
    if (loggingEnabled) {
        console.log(message);
    }
}
