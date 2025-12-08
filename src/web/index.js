const HTTPServer = require('../utils/http/HTTPServer');

class WebUI extends HTTPServer {
    constructor(options = { }) {
        super();
    }
}

module.exports = WebUI;