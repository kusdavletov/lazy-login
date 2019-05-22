const logger = function () {
    return console.log.apply(console, [`[${new Date().toISOString()}] ${[].slice.call(arguments)}`]);
};

module.exports = logger;