const HTTPServer = require('../utils/http/HTTPServer');
const HTTPRouter = require('../utils/http/HTTPRouter');

class API extends HTTPServer {
    constructor(options = { }) {
        super();

        // const v1Router = new HTTPRouter({
            // path: '/v1'
        // }).addServer(this.server);

        // require('./v1/jobs')(this, v1Router);

        this.any('*', (req, res) => {
            res.send('api 404', 'text/plain');
        });
    }
}

module.exports = API;