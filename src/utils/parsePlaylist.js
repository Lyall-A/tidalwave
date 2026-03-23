const { config, tidalPlaylistImageSizes } = require ('../globals');

const parseTrack = require('./parseTrack');
const parseVideo = require('./parseVideo');

function parsePlaylist(playlist, additional = { }) {
    return {
        uuid: playlist.uuid,
        title: playlist.title,
        description: playlist.description,
        duration: playlist.duration,
        images: playlist.squareImage && Object.fromEntries(Object.entries(tidalPlaylistImageSizes).map(([name, size]) => [name, `${config.resourcesBaseUrl}/images/${playlist.squareImage.replace(/-/g, '/')}/${size}.jpg`])) || undefined,
        // image: playlist.squareImage && `${config.resourcesBaseUrl}/images/${playlist.squareImage.replace(/-/g, '/')}/origin.jpg` || undefined,
        customImage: playlist.customImageUrl, // not used even with custom images?
        // trackCount: playlist.numberOfTracks,
        sharing: playlist.sharingLevel,
        created: playlist.created,
        lastUpdated: playlist.lastUpdated,
        items: additional?.items?.map(({ type, item }) => ({
            type,
            item:
                type === 'track'? parseTrack(item) :
                type === 'video' ? parseVideo(item) :
                null
        })).filter(({ item }) => item !== null)
    };
}

module.exports = parsePlaylist;