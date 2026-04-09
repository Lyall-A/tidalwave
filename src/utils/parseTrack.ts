import { Track } from '../types';

import parseArtist from './parseArtist';
import parseAlbum from './parseAlbum';

export default function parseTrack(track: any): Track {
    return {
        id: track.id,
        title: track.title,
        fullTitle: `${track.title}${track.version ? ` (${track.version})` : ''}`,
        version: track.version,
        duration: track.duration * 1000,
        upload: track.upload,
        copyright: track.copyright,
        explicit: track.explicit,
        mixId: track.mixes?.TRACK_MIX,
        isrc: track.isrc,
        quality: track.audioQuality,
        modes: track.audioModes,
        qualityTypes: track.mediaMetadata?.tags,
        trackNumber: track.trackNumber,
        volumeNumber: track.volumeNumber,
        replayGain: track.replayGain,
        peak: track.peak,
        bpm: track.bpm,
        key: track.key,
        keyScale: track.keyScale,
        url: track.url,
        artists: track.artists?.map(parseArtist),
        album: track.album && parseAlbum(track.album) || undefined
    };
}