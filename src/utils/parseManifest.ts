export default async function parseManifest(manifest: string, manifestType: string) {
    if (manifestType === 'application/dash+xml') {
        const parsedManifest: {
            contentType?: string;
            mimeType?: string;
            segmentAlignment?: string;
            codec?: string;
            bandwidth?: string;
            audioSamplingRate?: number;
            timescale?: string;
            initialization?: string;
            media?: string;
            startNumber?: number;
            segments: string[];
        } = {

            segments: []
        };

        // TODO: a little less jank perhaps
        parsedManifest.codec = manifest.match(/(?:<|\s)codecs="(.*?)"/)?.[1];
        parsedManifest.audioSamplingRate = parseInt(manifest.match(/(?:<|\s)audioSamplingRate="(.*?)"/)?.[1] as any);
        parsedManifest.initialization = manifest.match(/(?:<|\s)initialization="(.*?)"/)?.[1];
        parsedManifest.media = manifest.match(/(?:<|\s)media="(.*?)"/)?.[1];
        parsedManifest.startNumber = parseInt(manifest.match(/(?:<|\s)startNumber="(.*?)"/)?.[1] as any);

        for (let segmentIndex = 0; segmentIndex < parseInt(manifest.match(/(?:<|\s)r="(.*?)"/)?.[1] as any) + 3; segmentIndex++) {
            parsedManifest.segments.push(parsedManifest.media!.replace(/\$Number\$/, segmentIndex.toString()));
        }

        return parsedManifest;
    } else if (manifestType === 'application/vnd.tidal.emu') {
        const manifestJson = JSON.parse(manifest);

        const mainManifests = [];
        
        for (const url of manifestJson.urls) {
            const mainManifest = await fetch(url).then(i => i.text());

            const segmentManifests = Array.from(mainManifest.matchAll(/#EXT-X-STREAM-INF:BANDWIDTH=(.*?),AVERAGE-BANDWIDTH=(.*?),CODECS="(.*?)",RESOLUTION=(.*?)\n(.*?)\n/g)).map(i => ({
                bandwidth: i[1],
                averageBandwidth: i[2],
                codec: i[3],
                resolution: i[4],
                url: i[5],
                raw: null,
                segments: []
            }));

            for (const segmentManifest of segmentManifests) {
                segmentManifest.raw = await fetch(segmentManifest.url).then(i => i.text()) as any;
                segmentManifest.segments = Array.from((segmentManifest.raw! as string).matchAll(/#EXTINF:(.*?),\n(.*?)\n/g)).map(i => i[2]) as any;
            }

            mainManifests.push({
                url,
                raw: mainManifest,
                segmentManifests
            });
        }

        return {
            mimeType: manifestJson.mimeType,
            urls: manifestJson.urls,
            mainManifests
        };
    } else if (manifestType === 'application/vnd.tidal.bts') {
        const manifestJson = JSON.parse(manifest);
        
        return {
            mimeType: manifestJson.mimeType,
            codec: manifestJson.codecs,
            encryptionType: manifestJson.encryptionType,
            segments: manifestJson.urls
        }
    } else if (manifestType === 'application/vnd.apple.mpegurl') {
        const parsedManifest: {
            bandwidth?: number;
            averageBandwidth?: number;
            codec?: string;
            raw?: string;
            segments: string[];
        } = {
            segments: []
        };

        parsedManifest.bandwidth = parseInt(manifest.match(/BANDWIDTH=\d+/)?.[1] as any);
        parsedManifest.averageBandwidth = parseInt(manifest.match(/AVERAGE-BANDWIDTH=\d+/)?.[1] as any);
        parsedManifest.codec = manifest.match(/CODECS="(.*?)"/)?.[1]?.toLowerCase();
        parsedManifest.raw = Buffer.from(manifest.match(/data:application\/vnd\.apple\.mpegurl;base64,(.*)/)?.[1] as any, 'base64').toString();
        parsedManifest.segments = [parsedManifest.raw.match(/#EXT-X-MAP:URI="(.*?)"/)?.[1] as any, ...Array.from(parsedManifest.raw.matchAll(/#EXTINF:(.*?),\n(.*?)\n/g)).map(i => i[2])];

        return parsedManifest;
    } else {
        throw new Error(`Unknown manifest MIME type "${manifestType}"`);
    }

}