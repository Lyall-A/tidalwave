const { config } = require('../globals');

function normalizeTag(value, seperator = config.tagSeperator) {
    if (value instanceof Array) {
        if (seperator) return value.join(seperator);
        return value[0];
    } else {
        return value;
    };
}

module.exports = normalizeTag;