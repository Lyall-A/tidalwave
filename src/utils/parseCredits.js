const { logger, tidalCredits } = require('../globals');

function parseCredits(credits) {
    return credits.map(rawCredit => {
        const credit = tidalCredits.find(i => i.type.toLowerCase() === rawCredit.type.toLowerCase());
        if (!credit) return logger.debug(`Got unknown credit type "${rawCredit.type}", contributors: ${rawCredit.contributors.map(i => i.name).join(', ')}`);
        return {
            type: credit.type,
            tagName: credit.tagName,
            contributors: rawCredit.contributors
        }
    }).filter(i => i);
}

module.exports = parseCredits;