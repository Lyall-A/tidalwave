import { config, secrets, logger } from '../globals';

export default function tidalApi(api: string = 'openv2', path: string, options: {
    query?: object;
    method?: string;
    headers?: object;
    json?: any;
} = { }) {
    const baseUrl = api === 'openv2' ? config.openApiV2BaseUrl : api === 'privatev1' ? config.privateApiV1BaseUrl : api === 'privatev2' ? config.privateApiV2BaseUrl : null;
    const params = {
        ...(options.query || {}),
        locale: 'en_US',
        countryCode: secrets.countryCode,
        deviceType: 'BROWSER',
        platform: 'WEB'
    };
    const urlSearchParams = new URLSearchParams();
    new URLSearchParams(path.split('?')[1]).forEach((value, key) => urlSearchParams.append(key, value));
    Object.entries(params).forEach(([key, value]) => urlSearchParams.append(key, value));

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

        logger.log(`API: ${api}, path: ${path}, params: ${urlSearchParams.toString()}, response: ${status}${statusText ? ` ${statusText}` : ''}`, 'debug');

        return {
            status,
            statusText,
            text,
            json
        };
    });
}