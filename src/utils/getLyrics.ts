import tidalApi from './tidalApi';

export default async function getLyrics(trackId: number) {
    return tidalApi('privatev1', `/tracks/${trackId}/lyrics`).then(({ json }: any) => ({
        provider: json.lyricsProvider,
        plainLyrics: json.lyrics,
        syncedLyrics: json.subtitles,
    }));
}