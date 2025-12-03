const { EventEmitter } = require('events');
const HTTPServer = require('../utils/http/HTTPServer');

class API extends EventEmitter {
    constructor(options = { }) {
        super();

        this.port = options.port;

        this.server = new HTTPServer({
            port: this.port
        });
        
        this.server.listen(); // for testing

        this.server.get('/', (req, res) => {
            console.log(req);
        });
    }
}

module.exports = API;