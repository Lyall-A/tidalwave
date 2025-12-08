const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const HTTPRouter = require('./HTTPRouter');
const HTTPRequest = require('./HTTPRequest');
const HTTPResponse = require('./HTTPResponse');

class HTTPServer extends HTTPRouter {
    constructor(options = { }) {
        super(options.routerOptions);
        
        // Options
        this.ssl = options.ssl ?? false;
        this.port = options.port ?? (this.ssl ? 443 : 80);
        this.hostname = options.hostname ?? '0.0.0.0';
        
        // Create server
        if (this.ssl) {
            this.server = https.createServer({
                // TODO: certs
            });
        } else {
            this.server = http.createServer();
        }
        
        // Setup routing for server
        this.addServer(this.server);

        // Routes
        this.any(null, (req, res, params, next) => {
            // Update request and response
            HTTPRequest.assign(req);
            HTTPResponse.assign(res);
            next();
        });
    }

    listen(port = this.port, hostname = this.hostname) {
        return new Promise((resolve, reject) => {
            this.server.listen(port, hostname, err => {
                if (err) return reject(err);
                return resolve(this);
            });
        });
    }
}

module.exports = HTTPServer;