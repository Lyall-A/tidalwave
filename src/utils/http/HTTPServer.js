const { EventEmitter } = require('events');
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const HTTPRouter = require('./HTTPRouter');

class HTTPServer extends EventEmitter {
    constructor(options = { }) {
        super();

        this.ssl = options.ssl ?? false;
        this.port = options.port ?? (this.ssl ? 443 : 80);
        this.hostname = options.hostname ?? '0.0.0.0';
        
        if (this.ssl) {
            this.server = https.createServer({
                // TODO: certs
            });
        } else {
            this.server = http.createServer();
        }

        this.router = new HTTPRouter().addServer(this.server);
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