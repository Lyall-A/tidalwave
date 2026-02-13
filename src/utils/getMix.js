const tidalApi = require('./tidalApi');
const parseMix = require('./parseMix');

async function getMix(mixId) {
    return tidalApi('privatev1', '/pages/mix', { query: { mixId } }).then(({ json }) => parseMix(json.rows[0].modules[0].mix, {
        items: json.rows[1].modules[0].pagedList.items
    }));
}

module.exports = getMix;