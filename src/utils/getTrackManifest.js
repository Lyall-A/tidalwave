const tidalApi = require('./tidalApi');

function getTrackManifest(id, formats = ['HEAACV1', 'AACLC', 'FLAC', 'FLAC_HIRES']) {
    return tidalApi('openv2', `/trackManifests/${id}?adaptive=false${formats.map(format => `&formats=${format}`).join('&')}&manifestType=MPEG_DASH&uriScheme=DATA&usage=PLAYBACK`).then(res => res.json.data);
}

module.exports = getTrackManifest;