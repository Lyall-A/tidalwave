const { config, secrets, logger } = require('../globals');

function tidalApi(api = 'openv2', path, options = { }) {
    const baseUrl = api === 'openv2' ? config.openApiV2BaseUrl : api === 'privatev1' ? config.privateApiV1BaseUrl : api === 'privatev2' ? config.privateApiV2BaseUrl : null;
    const params = {
        ...Object.fromEntries(new URLSearchParams(path.split('?')[1])),
        ...(options.query || {}),
        locale: 'en_US',
        countryCode: secrets.countryCode,
        deviceType: 'BROWSER',
        platform: 'WEB'
    };
    const urlSearchParams = new URLSearchParams(params);

    path = path.split('?')[0];

    return fetch(`${baseUrl}${path}?${urlSearchParams.toString()}`, {
        method: options.method || 'GET',
        headers: {
            ...(options.headers || { }),
            ...(options.json ? { 'Content-Type': 'application/json' } : { }),
            Authorization: `${secrets.tokenType} ${secrets.accessToken}`,
            'X-Tidal-Client-Version': ''
        },
        body: options.json ? JSON.stringify(options.json) : undefined
    }).then(async res => {
        const { status, statusText } = res;
        const text = await res.text();
        let json;
        try { json = JSON.parse(text) } catch (err) { };

        logger.debug(`API: ${api}, Path: ${path}, Params: ${urlSearchParams.toString()}, Response: ${status}${statusText ? ` ${statusText}` : ''}`);

        return {
            status,
            statusText,
            text,
            json
        }
    });
}

module.exports = tidalApi;