const { IncomingMessage, ServerResponse } = require('http');

class HTTPRouter {
    routes = [ ];

    constructor(options = { }) {        
        this.singleSlash = options.singleSlash ?? true;
        this.caseSensitive = options.caseSensitive ?? true;
    }

    addServer = (server) => {
        server.on('request', this.handleRequest);
        return this;
    }

    handleRequest = async (req, res) => {
        const routes = this.findRoutes(req.method, req.url);
        for (const route of routes) {
            const params = { }; // TODO
            let next = false;
            await route.callback(req, res, params, () => next = true);
            if (!next) break;
        }
    }
    createRouteFunction = (method) => { 
        /**
         * @param {(req: IncomingMessage, res: ServerResponse) => void} callback
         */
        return (path, callback) => {
            this.routes.push({
                method,
                path,
                callback
            });
        }
    }

    findRoutes = (method, url) => {
        // TODO: params and wildcard stuff
        let path = url.match(/\/[^?]*[^/?]/)?.[0] || '/';
        if (this.singleSlash) path = path.replace(/\/{2,}/g, '/');

        const routes = this.routes.filter(route => {
            if (route.method && route.method !== method) return;
            if (route.path && route.path !== path) return;
            return true;
        });

        return routes;
    }

    any = this.createRouteFunction();
    get = this.createRouteFunction('GET');
    post = this.createRouteFunction('POST');
    put = this.createRouteFunction('PUT');
    delete = this.createRouteFunction('DELETE');
}

module.exports = HTTPRouter;