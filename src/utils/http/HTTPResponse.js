const { ServerResponse } = require('http');
const fs = require('fs');

class HTTPResponse {
    /**
     * @param {ServerResponse} rawResponse 
     */
    constructor(rawResponse) {
        this._raw = rawResponse;
    }

    send = (data, contentType) => {
        this._raw.writeHead(200, { 'Content-Type': contentType });
        this._raw.end(data);
    }

    sendFile = (file, contentType) => {
        const readStream = fs.createReadStream(file);
        
        this._raw.writeHead(200, { 'Content-Type': contentType });
        
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