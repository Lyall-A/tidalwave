const { EventEmitter } = require('events');

class HTTPRouter extends EventEmitter {
    constructor(options = { }) {
        super();
        
        this.singleSlash = options.singleSlash ?? true;
    }

    addServer = (server) => {
        server.on('request', this.handleRequest);
        return this;
    }

    handleRequest = (req, res) => {
        const path = req.url.match(/\/?([^?]*[^/?])/)?.[1] || '';
        const paths = path?.split('/').filter(path => this.singleSlash ? path : true);
        const searchParams = new URLSearchParams(req.url.match(/\?(.*)/)?.[0]);

        console.log(paths)
    }
}

module.exports = HTTPRouter;