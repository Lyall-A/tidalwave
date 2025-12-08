const HTTPServer = require('../utils/http/HTTPServer');

class API extends HTTPServer {
    constructor(options = { }) {
        super();

        this.get('/', (req, res) => {
            res.send('hello world', 'text/plain');
        });
    }
}

module.exports = API;