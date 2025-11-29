const { EventEmitter } = require('events');
const HTTPServer = require('../utils/http/HTTPServer');

class WebUI extends EventEmitter {
    constructor(options = { }) {
        super();

        this.server = new HTTPServer();
    }
}

module.exports = WebUI;