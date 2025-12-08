const HTTPServer = require('../utils/http/HTTPServer');
const path = require('path');

const { execDir } = require('../globals');

class WebUI extends HTTPServer {
    constructor(options = { }) {
        super();

        this.routeDirectory(path.join(execDir, 'web', 'public'));
    }
}

module.exports = WebUI;