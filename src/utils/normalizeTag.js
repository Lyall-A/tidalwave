function normalizeTag(value, separator) {
    if (value instanceof Array) {
        if (separator) return value.join(separator);
        return value[0];
    } else {
        return value;
    };
}

module.exports = normalizeTag;