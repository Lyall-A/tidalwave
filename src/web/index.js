const HTTPServer = require('../utils/http/HTTPServer');
const fs = require('fs/promises');
const path = require('path');

const { execDir } = require('../globals');

class WebUI extends HTTPServer {
    constructor(options = { }) {
        super();

        this.get(null, async (req, res) => {
            const filePath = path.join(execDir, 'web', 'public', req.path);
            try {
                const stat = await fs.stat(filePath);
                if (stat.isFile()) {
                    res.sendFile(filePath);
                }
            } catch (err) {
                // TODO: 404
                res.send('404');
            }
        });
    }
}

module.exports = WebUI;