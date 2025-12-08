const { IncomingMessage } = require('http');

class HTTPRequest {
    /**
     * @param {IncomingMessage} rawRequest 
     */
    constructor(rawRequest) {
        this._raw = rawRequest;

        this.path = this._raw.url.match(/[^?]*/)?.[0];
        this.queryString = this._raw.url.match(/(?<=\?).*/)?.[0];
        this.query = new URLSearchParams(this.queryString);
    }

    static assign(rawRequest) {
        const request = new HTTPRequest(rawRequest);
        Object.assign(rawRequest, request);
        return request;
    }
}

module.exports = HTTPRequest;