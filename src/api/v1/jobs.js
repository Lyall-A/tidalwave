const API = require("../");
const HTTPRouter = require('../../utils/http/HTTPRouter');

/**
 * @param {API} api 
 * @param {HTTPRouter} router 
 */
module.exports = (api, router) => {
    router.get('/test', (req, res) => {
        console.log('got it', req.path);
    });
}