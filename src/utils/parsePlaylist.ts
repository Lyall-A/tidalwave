import { config, tidalPlaylistImageSizes } from '../globals';

import parseTrack from './parseTrack';
import parseVideo from './parseVideo';

export default function parsePlaylist(playlist: any, additional: any = { }) {
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
        items: additional?.items?.map(({ type, item }: any) => ({
            type,
            item:
                type === 'track'? parseTrack(item) :
                type === 'video' ? parseVideo(item) :
                null
        })).filter(({ item }: any) => item !== null)
    };
}