import stripMarkup from './stripMarkup';

import { config, tidalAlbumCoverSizes } from '../globals';
import { Album } from '../types';

import parseTrack from './parseTrack';
import parseArtist from './parseArtist';
import parseCredits from './parseCredits';

export default function parseAlbum(album: any, additional: any = { }): Album {
    return {
        id: album.id,
        title: album.title,
        version: album.version, // NOTE: title seems to already include version, unlike track title
        description: additional?.description,
        type: album.type,
        duration: album.duration * 1000,
        upload: album.upload,
        trackCount: album.numberOfTracks,
        volumeCount: album.numberOfVolumes,
        releaseDate: album.releaseDate,
        copyright: album.copyright,
        explicit: album.explicit,
        upc: album.upc,
        covers: album.cover && Object.fromEntries(Object.entries(tidalAlbumCoverSizes).map(([name, size]) => [name, `${config.resourcesBaseUrl}/images/${album.cover.replace(/-/g, '/')}/${size}.jpg`])) || null,
        videoCovers: album.videoCover && Object.fromEntries(Object.entries(tidalAlbumCoverSizes).map(([name, size]) => [name, `${config.resourcesBaseUrl}/videos/${album.cover.replace(/-/g, '/')}/${size}.mp4`])) || null,
        quality: album.audioQuality,
        modes: album.audioModes,
        qualityTypes: album.mediaMetadata?.tags,
        credits: additional?.credits?.items ? parseCredits(additional.credits.items) : null,
        trackCredits: additional?.trackCredits ? additional.trackCredits.map((i: any) => ({ track: i.item, credits: parseCredits(i.credits) })) : null,
        review: additional?.review?.text ? {
            originalText: additional.review.text,
            text: stripMarkup(additional.review.text),
            source: additional.review.source
        } : null,
        url: album.url,
        artists: album.artists?.map(parseArtist),
        tracks: additional?.tracks?.map(parseTrack),
    };
}