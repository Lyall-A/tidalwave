const { ServerResponse } = require('http');
const path = require('path')
const fs = require('fs');

const mimeTypes = require('./mimeTypes');

class HTTPResponse {
    /**
     * @param {ServerResponse} rawResponse 
     */
    constructor(rawResponse) {
        this._raw = rawResponse;
    }

    send = (data, contentType) => {
        this._raw.writeHead(200, { 'Content-Type': contentType || 'text/plain' });
        this._raw.end(data);
    }

    sendFile = (file, contentType) => {
        const readStream = fs.createReadStream(file);
        
        this._raw.writeHead(200, { 'Content-Type': contentType || mimeTypes[path.extname(file)] || 'application/octet-stream' });
        
        readStream.on('data', data => {
            this._raw.write(data);
        });

        readStream.on('end', () => {
            this._raw.end();
        });
    }

    static assign(rawResponse) {
        const response = new HTTPResponse(rawResponse);
        Object.assign(rawResponse, response);
        return response;
    }
}

module.exports = HTTPResponse;