const tidalApi = require('./tidalApi');

const { secrets } = require('../globals');

function getSubscription() {
    return tidalApi('privatev1', `/users/${secrets.userId}/subscription`).then(({ json }) => ({
        startDate: new Date(json.startDate),
        validUntilDate: new Date(json.validUntil),
        status: json.status,
        subscriptionType: json.subscription.type,
        highestSoundQuality: json.highestSoundQuality,
        premium: json.premiumAccess,
        canGetTrial: json.canGetTrial,
        paymentType: json.paymentType,
        paymentOverdue: json.paymentOverdue,
    }));
}

module.exports = getSubscription;