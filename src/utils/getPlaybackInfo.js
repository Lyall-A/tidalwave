const tidalApi = require('./tidalApi');

function getPlaybackInfo(id, type = 'track', quality = 'HI_RES_LOSSLESS', immersiveAudio = false, playbackMode = 'STREAM', assetPresentation = 'FULL') {
    const isVideo = type === 'video' ? true : false;

    return tidalApi('privatev1', `/${type === 'video' ? 'videos' : 'tracks'}/${id}/playbackinfo`, {
        query: {
            ...(isVideo ? { videoquality: quality } : { audioquality: quality }),
            immersiveaudio: immersiveAudio,
            playbackmode: playbackMode,
            assetpresentation: assetPresentation
        }
    }).then(res => res.json);
}

module.exports = getPlaybackInfo;