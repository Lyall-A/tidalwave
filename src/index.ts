import fs from 'fs';
import path from 'path';

import requestDeviceAuthorization from './utils/requestDeviceAuthorization';
import getToken from './utils/getToken';
import getAlbum from'./utils/getAlbum';
import getArtist from'./utils/getArtist';
import getTrack from './utils/getTrack';
import getVideo from'./utils/getVideo';
import getPlaylist from'./utils/getPlaylist';
import getMix from'./utils/getMix';
import search from'./utils/search';
import Args from './utils/Args';
import formatPath from'./utils/formatPath';
import Logger from './utils/Logger';
import Download from'./utils/Download';

import {
    config,
    secrets,
    secretsPath,
    argOptions,
    execDir,
    logger,
    tidalTrackQualities,
    tidalVideoQualities
} from './globals.js';
import { Album, Artist, Mix, Playlist, Track, Video } from './types';

const args = new Args(process.argv, argOptions);
const options = {
    help: args.get('help'),
    debug: args.get('debug') ?? config.debug,

    tracks: args.getAll('track'),
    albums: args.getAll('album'),
    videos: args.getAll('video'),
    artists: args.getAll('artist'),
    playlists: args.getAll('playlist'),
    mixes: args.getAll('mix'),
    searches: [
        ...args.getAll('search').map(query => ({ type: null, query })),
        ...args.getAll('search:track').map(query => ({ type: 'track', query })),
        ...args.getAll('search:album').map(query => ({ type: 'album', query })),
        ...args.getAll('search:video').map(query => ({ type: 'video', query })),
        ...args.getAll('search:artist').map(query => ({ type: 'artist', query })),
        ...args.getAll('search:playlist').map(query => ({ type: 'playlist', query })),
    ],
    urls: args.getAll('url'),
    updates: args.getAll('update'),

    trackQuality: (args.get('track-quality') ?? config.trackQuality)?.toUpperCase(),
    videoQuality: (args.get('video-quality') ?? config.videoQuality)?.toUpperCase(),
    dolbyAtmos: args.get('dolby-atmos') ?? config.useDolbyAtmos,
    metadata: args.get('metadata') ?? config.embedMetadata,
    lyrics: args.get('lyrics') ?? config.getLyrics,
    cover: args.get('cover') ?? config.getCover,
    overwrite: args.get('overwrite') ?? config.overwriteExisting,
};
logger.debugLogs = options.debug;

logger.log(`Options:\n${JSON.stringify(options, null, 4)}`, 'debug');

// Show help
if (options.help || [
    ...options.tracks,
    ...options.albums,
    ...options.videos,
    ...options.artists,
    ...options.playlists,
    ...options.mixes,
    ...options.searches,
    ...options.urls
].length === 0) showHelp();

(async () => {
    await authorize();

    const tracks: Track[] = [];
    const albums: Album[] = [];
    const videos: Video[] = [];
    const artists: Artist[] = [];

    // Tracks to be downloaded
    const queue: {
        track?: Track;
        album?: Album;
        video?: Video;
        artists?: Artist[];
        albumArtists?: Artist[];
        playlist?: Playlist;
        mix?: Mix;
        itemIndex?: number;
    }[] = [];

    for (const trackId of options.tracks) await addTrack(trackId); // Tracks
    for (const albumId of options.albums) await addAlbum(albumId); // Albums
    for (const videoId of options.videos) await addVideo(videoId); // Videos
    for (const artistId of options.artists) await addArtist(artistId); // Artists
    for (const playlistUuid of options.playlists) await addPlaylist(playlistUuid); // Playlists
    for (const mixId of options.mixes) await addMix(mixId); // Mixes

    // Searches
    for (const { type, query } of options.searches) {
        logger.log(`Searching for: ${Logger.applyColor({ bold: true }, query)}`, 'info', true);
        const result = await search(query, 1).then(results => (
            type === 'track' ? results.tracks.map(value => ({ type, value })) :
            type === 'album' ? results.albums.map(value => ({ type, value })) :
            type === 'video' ? results.videos.map(value => ({ type, value })) :
            type === 'artist' ? results.artists.map(value => ({ type, value })) :
            type === 'playlist' ? results.playlists.map(value => ({ type, value })) :
            results.topResults
        )[0]);

        if (result?.type === 'track') await addTrack((result.value as Track).id); else
        if (result?.type === 'album') await addAlbum((result.value as Album).id); else
        if (result?.type === 'video') await addVideo((result.value as Video).id); else
        if (result?.type === 'artist') await addArtist((result.value as Artist).id); else
        if (result?.type === 'playlist') await addPlaylist((result.value as Playlist).uuid); else
        logger.log(`No search results for "${Logger.applyColor({ bold: true }, query)}"`, 'error', true, true);
    }

    // URLS
    for (const url of options.urls) {
        const match = url.match(/tidal\.com.*\/(track|album|video|artist|playlist|mix)\/([0-9a-f-]+)/i);
        if (match) {
            const type = match[1].toLowerCase();
            const id = match[2];
            const idInt = parseInt(id, 10);

            if (type === 'track') await addTrack(idInt); else
            if (type === 'album') await addAlbum(idInt); else
            if (type === 'video') await addVideo(idInt); else
            if (type === 'artist') await addArtist(idInt); else
            if (type === 'playlist') await addPlaylist(id); else
            if (type === 'mix') await addMix(id); else
            logger.log(`Unknown type "${Logger.applyColor({ bold: true }, type)}"`, 'error', true, true); // NOTE: not possible with current regex
        } else {
            logger.log(`Couldn't determine URL "${Logger.applyColor({ bold: true }, url)}"`, 'error', true, true);
        }
    }

    // const startDate = Date.now();

    logger.emptyLine();
    logger.log(`Downloading ${Object.entries({
            track: queue.filter((item: any) => item.track).length,
            video: queue.filter((item: any) => item.video).length,
        })
            .filter(([type, count]) => count > 0)
            .map(([type, count]) => `${Logger.applyColor({ bold: true }, count)} ${type}${count !== 1 ? 's' : ''}`)
            .join(', ')}...`, 'info');

    for (let itemIndex = 0; itemIndex < queue.length; itemIndex++) {
        const item = queue[itemIndex];

        const details = {
            track: item.track,
            album: item.album,
            video: item.video,
            artists: item.artists,
            albumArtists: item.albumArtists,
            playlist: item.playlist,
            mix: item.mix,
            itemIndex: item.itemIndex, // used for playlists and mixes

            artist: item.artists?.[0],
            albumArtist: item.albumArtists?.[0],
            trackNumberPadded: item.track?.trackNumber?.toString().padStart(2, '0'), // TODO: maybe remove this and add a padding function in formatString?
            queueNum: itemIndex + 1,
            itemNum: item.itemIndex && item.itemIndex + 1,
            playlistCover: item.playlist ? item.playlist.images[config.playlistCoverSize?.toUpperCase()] || item.playlist.images['ORIGINAL'] : null,
            mixCover: item.mix ? item.mix.images[config.mixCoverSize?.toUpperCase()] || item.mix.images['LARGE'] : null,
            mixDetailCover: item.mix ? item.mix.detailImages[config.mixCoverSize?.toUpperCase()] || item.mix.images['LARGE'] : null, // not currently used
            isTrack: item.track ? true : false,
            isVideo: item.video ? true : false,
            isPlaylist: item.playlist ? true : false,
            isMix: item.mix ? true : false,

            // Generic details
            type:
                item.track ? 'track' :
                item.video ? 'video' :
                null,
            id:
                item.track ? item.track.id :
                item.video ? item.video.id :
                null,
            title:
                item.track ? item.track.fullTitle :
                item.video ? item.video.title :
                null,
            duration:
                item.track ? item.track.duration :
                item.video ? item.video.duration :
                null,
            cover:
                item.album ? item.album.covers[config.trackCoverSize?.toUpperCase()] || item.album.covers['1280'] :
                item.video ? item.video.images[config.videoCoverSize?.toUpperCase()] || item.video.images['1280x720'] :
                null,
            url:
                item.album ? `https://tidal.com/album/${item.album.id}` :
                item.video ? `https://tidal.com/video/${item.video.id}` :
                null,
            releaseDate:
                item.album?.releaseDate ? new Date(item.album.releaseDate).toISOString().split('T')[0] :
                item.video?.releaseDate ? new Date(item.video.releaseDate).toISOString().split('T')[0] :
                null,
            releaseYear:
                item.album?.releaseDate ? new Date(item.album.releaseDate).getFullYear() :
                item.video?.releaseDate ? new Date(item.video.releaseDate).getFullYear() :
                null,
            explicit:
                item.track ? item.track.explicit :
                item.video ? item.video.explicit :
                null,
        };

        if (options.updates[itemIndex]) {
            const updatePath = path.resolve(execDir, options.updates[itemIndex]);
            const updatePathDirectory = path.dirname(updatePath);
            const updatePathExtension = path.extname(updatePath);
            const updatePathFilename = path.basename(updatePath, updatePathExtension);

            const download = new Download({
                // Update item
                details,
                logger,
                directory: updatePathDirectory,
                mediaFilename: updatePathFilename,
                coverFilename: updatePathFilename,

                metadataEmbedder: config.metadataEmbedder,
                keepCoverFile: true,
                getCover: options.cover,
                getLyrics: options.lyrics,
                syncedLyricsOnly: config.syncedLyricsOnly,
                plainLyricsOnly: config.plainLyricsOnly,
                externalLyrics: config.externalLyrics,
                useArtistsTag: config.useArtistsTag,
                artistTagSeparator: config.artistTagSeparator,
                roleTagSeparator: config.roleTagSeparator,
                customMetadata: config.customMetadata,
                downloadLogPadding: config.downloadLogPadding,
                logPrefix: `${Logger.applyColor({ bold: true }, `[${itemIndex + 1} / ${queue.length}]`)} Updating ${Logger.applyColor({ bold: true }, details.title)} - ${Logger.applyColor({ bold: true }, details.artist?.name)}: `,

                originalExtension: updatePathExtension,
                mediaExtension: updatePathExtension,
            });

            await download.getMetadata(); // Get metadata
            fs.renameSync(updatePath, download.getOriginalPath()); // Rename original file temporarily
            await download.createMedia(); // Create new file
            fs.unlinkSync(download.getOriginalPath()); // Delete original file
        } else {
            const typeOptions = {
                ...config.defaultTypeOptions,
                ...config.typeOptions[
                    details.isPlaylist ? 'playlist' :
                    details.isMix ? 'mix' :
                    details.isVideo ? 'video' :
                    'album' // NOTE: we dont know whether a entire album is in the queue or just 1 track
                ],
            };
            const directory = path.resolve(execDir, formatPath(typeOptions.directory, details));
            const mediaFilename = formatPath(typeOptions.filename, details);
            const coverFilename = typeOptions.coverFilename ? formatPath(typeOptions.coverFilename, details) : mediaFilename;

            // Download item
            await new Download({
                details,
                logger,
                directory,
                mediaFilename,
                coverFilename,
                playlistCoverFilename: (config.playlistCoverFilename && formatPath(config.playlistCoverFilename, details)) || (config.mixCoverFilename && formatPath(config.mixCoverFilename, details)),
                playlistFileFilename: (config.playlistFileFilename && formatPath(config.playlistFileFilename, details)) || (config.mixFileFilename && formatPath(config.mixFileFilename, details)),
                trackQuality: tidalTrackQualities[options.trackQuality as keyof typeof tidalTrackQualities] === undefined ? options.trackQuality : tidalTrackQualities[options.trackQuality as keyof typeof tidalTrackQualities],
                videoQuality: tidalVideoQualities[options.videoQuality as keyof typeof tidalVideoQualities] === undefined ? options.videoQuality : tidalVideoQualities[options.videoQuality as keyof typeof tidalVideoQualities],
                overwriteExisting: options.overwrite,
                embedMetadata: options.metadata,
                metadataEmbedder: config.metadataEmbedder,
                keepCoverFile: typeOptions.coverFilename ? true : false,
                getCover: options.cover,
                getLyrics: options.lyrics,
                syncedLyricsOnly: config.syncedLyricsOnly,
                plainLyricsOnly: config.plainLyricsOnly,
                externalLyrics: config.externalLyrics,
                useArtistsTag: config.useArtistsTag,
                artistTagSeparator: config.artistTagSeparator,
                roleTagSeparator: config.roleTagSeparator,
                customMetadata: config.customMetadata,
                keepOriginalFile: options.debug ? true : false,
                segmentWaitMin: config.segmentWaitMin,
                segmentWaitMax: config.segmentWaitMax,
                downloadLogPadding: config.downloadLogPadding,
                logPrefix: `${Logger.applyColor({ bold: true }, `[${itemIndex + 1} / ${queue.length}]`)} Downloading ${Logger.applyColor({ bold: true }, details.title)} - ${Logger.applyColor({ bold: true }, details.artist?.name)}: `,
                useDolbyAtmos: options.dolbyAtmos
            }).download();
        }
    }

    // logger.emptyLine();
    // logger.log(`Finished in ${((Date.now() - startDate) / 1000 / 60).toFixed(2)} minute(s)`, 'info');

    async function addTrack(trackId: number) {
        const artists = [];
        const albumArtists = [];

        try {
            const track = await findTrack(trackId);

            if (track.upload && !config.allowUserUploads) throw new Error('User uploads are disabled');

            const album = await findAlbum(track.album.id, track.album);
            for (const artist of track.artists) artists.push(await findArtist(artist.id, artist));
            for (const artist of album.artists || []) albumArtists.push(await findArtist(artist.id, artist));

            queue.push({
                track,
                album,
                artists,
                albumArtists
            });

            logger.log(`Found track: ${Logger.applyColor({ bold: true }, `${track.fullTitle} - ${track.artists[0].name}`)} (${track.id})`, 'info', true, true);
        } catch (err) {
            logger.log(`Could not find track ID: ${Logger.applyColor({ bold: true }, trackId)}`, 'error', true, true);
        }
    }

    async function addAlbum(albumId: number) {
        const tracks = [];

        try {
            const album = await findAlbum(albumId);

            if (album.upload && !config.allowUserUploads) throw new Error('User uploads are disabled');

            for (const track of album.tracks) tracks.push(await findTrack(track.id, track));

            for (const track of tracks) {
                const artists = [];
                const albumArtists = [];

                for (const artist of track.artists || []) artists.push(await findArtist(artist.id, artist));
                for (const artist of album.artists) albumArtists.push(await findArtist(artist.id, artist));

                queue.push({
                    track,
                    album,
                    artists,
                    albumArtists
                });
            }

            logger.log(`Found album: ${Logger.applyColor({ bold: true }, `${album.title} - ${album.artists[0].name}`)} (${album.id})`, 'info', true, true);
        } catch (err) {
            logger.log(`Could not find album ID: ${Logger.applyColor({ bold: true }, albumId)}`, 'error', true, true);
        }
    }

    async function addVideo(videoId: number) {
        const artists = [];

        try {
            const video = await findVideo(videoId);

            for (const artist of video.artists) artists.push(await findArtist(artist.id, artist));

            queue.push({
                video,
                artists,
            });

            logger.log(`Found video: ${Logger.applyColor({ bold: true }, `${video.title} - ${video.artists[0].name}`)} (${video.id})`, 'info', true, true);
        } catch (err) {
            logger.log(`Could not find video ID: ${Logger.applyColor({ bold: true }, videoId)}`, 'error', true, true);
        }
    }

    async function addArtist(artistId: number) {
        try {
            const artist = await findArtist(artistId);

            for (const partialAlbum of artist.albums) {
                const tracks = [];

                const album = await findAlbum(partialAlbum.id, partialAlbum);
                for (const track of album.tracks || []) tracks.push(await findTrack(track.id, track));

                for (const track of tracks) {
                    const artists = [];
                    const albumArtists = [];

                    for (const artist of track.artists || []) artists.push(await findArtist(artist.id, artist));
                    for (const artist of album.artists || []) albumArtists.push(await findArtist(artist.id, artist));

                    queue.push({
                        track,
                        album,
                        artists,
                        albumArtists
                    });
                }
            }

            logger.log(`Found artist: ${Logger.applyColor({ bold: true }, `${artist.name} - ${artist.albums.length} albums`)} (${artist.id})`, 'info', true, true);
        } catch (err) {
            logger.log(`Could not find artist ID: ${Logger.applyColor({ bold: true }, artistId)}`, 'error', true, true);
        }
    }

    async function addPlaylist(playlistUuid: string) {
        try {
            const playlist = await getPlaylist(playlistUuid);

            for (let itemIndex = 0; itemIndex < playlist.items.length; itemIndex++) {
                const { type: itemType, item } = playlist.items[itemIndex];

                // We don't need to fetch the track/video here, everything needed seems to be included already
                if (itemType === 'track') {
                    const track = item as Track;

                    const artists = [];
                    const albumArtists = [];

                    const album = await findAlbum(track.album.id, track.album);
                    for (const artist of track.artists || []) artists.push(await findArtist(artist.id, artist));
                    for (const artist of album.artists || []) albumArtists.push(await findArtist(artist.id, artist));

                    queue.push({
                        track,
                        album,
                        artists,
                        albumArtists,
                        playlist,
                        itemIndex
                    });
                } else if (itemType === 'video') {
                    const video = item as Video;

                    const artists = [];

                    for (const artist of video.artists) artists.push(await findArtist(artist.id, artist));

                    queue.push({
                        video,
                        artists,
                        playlist,
                        itemIndex
                    });
                }
            }

            logger.log(`Found playlist: ${Logger.applyColor({ bold: true }, `${playlist.title} - ${playlist.items.length} items`)} (${playlist.uuid})`, 'info', true, true);
        } catch (err) {
            logger.log(`Could not find playlist UUID: ${Logger.applyColor({ bold: true }, playlistUuid)}`, 'error', true, true);
        }
    }

    async function addMix(mixId: number) {
        try {
            const mix = await getMix(mixId);

            for (let itemIndex = 0; itemIndex < mix.tracks.length; itemIndex++) {
                const partialTrack = mix.tracks[itemIndex];
                const track = await findTrack(partialTrack.id, partialTrack);

                const artists = [];
                const albumArtists = [];

                const album = await findAlbum(track.album.id, track.album);
                for (const artist of track.artists || []) artists.push(await findArtist(artist.id, artist));
                for (const artist of album.artists || []) albumArtists.push(await findArtist(artist.id, artist));

                queue.push({
                    track,
                    album,
                    artists,
                    albumArtists,
                    mix,
                    itemIndex
                });
            }

            logger.log(`Found mix: ${Logger.applyColor({ bold: true }, `${mix.title} - ${mix.subTitle}`)} (${mix.id})`, 'info', true, true);
        } catch (err) {
            logger.log(`Could not find mix ID: ${Logger.applyColor({ bold: true }, mixId)}`, 'error', true, true);
        }
    }

    async function findTrack(trackId: number, partialData?: Track) {
        const foundTrack = tracks.find(track => track.id === trackId);
        if (foundTrack) {
            logger.log(`Found already fetched track: ${trackId}`, 'debug');
            return foundTrack;
        } else if (partialData && config.forcePartialData) {
            logger.log(`Using partial data for track ${Logger.applyColor({ bold: true }, trackId)}, some information may be missing!`, 'warn', true, true);
            return partialData;
        } else {
            logger.log(`Getting information about track: ${Logger.applyColor({ bold: true }, trackId)}`, 'info', true);
            const track = await getTrack(trackId).catch(err => {
                if (partialData && config.partialDataFallback) {
                    logger.log(`Failed to get track ${Logger.applyColor({ bold: true }, trackId)}, some information may be missing!`, 'warn', true, true);
                    return partialData;
                } else throw err;
            });
            tracks.push(track);
            return track;
        }
    }

    async function findAlbum(albumId: number, partialData?: Album) {
        const foundAlbum = albums.find(album => album.id === albumId);
        if (foundAlbum) {
            logger.log(`Found already fetched album: ${albumId}`, 'debug');
            return foundAlbum;
        } else if (partialData && config.forcePartialData) {
            logger.log(`Using partial data for album ${Logger.applyColor({ bold: true }, albumId)}, some information may be missing!`, 'warn', true, true);
            return partialData;
        } else {
            logger.log(`Getting information about album: ${Logger.applyColor({ bold: true }, albumId)}`, 'info', true);
            const album = await getAlbum(albumId).catch(err => {
                if (partialData && config.partialDataFallback) {
                    logger.log(`Failed to get album ${Logger.applyColor({ bold: true }, albumId)}, some information may be missing!`, 'warn', true, true);
                    return partialData;
                } else throw err;
            });
            albums.push(album);
            return album;
        }
    }

    async function findVideo(videoId: number): Promise<any> {
        const foundVideo = videos.find((video: any) => video.id === videoId);
        if (foundVideo) {
            logger.log(`Found already fetched video: ${videoId}`, 'debug');
            return videoId;
        } else {
            logger.log(`Getting information about video: ${Logger.applyColor({ bold: true }, videoId)}`, 'info', true);
            const video = await getVideo(videoId);
            videos.push(video);
            return video;
        }
    }

    async function findArtist(artistId: number, partialData?: Artist) {
        const foundArtist = artists.find(artist => artist.id === artistId);
        if (foundArtist) {
            logger.log(`Found already fetched artist: ${artistId}`, 'debug');
            return foundArtist;
        } else if (partialData && config.forcePartialData) {
            logger.log(`Using partial data for artist ${Logger.applyColor({ bold: true }, artistId)}, some information may be missing!`, 'warn', true, true);
            return partialData;
        } else {
            logger.log(`Getting information about artist: ${Logger.applyColor({ bold: true }, artistId)}`, 'info', true);
            const artist = await getArtist(artistId).catch(err => {
                if (partialData && config.partialDataFallback) {
                    logger.log(`Failed to get artist ${Logger.applyColor({ bold: true }, artistId)}, some information may be missing!`, 'warn', true, true);
                    return partialData;
                } else throw err;
            });
            artists.push(artist);
            return artist;
        }
    }
})();

async function authorize() {
    if (secrets.accessToken &&
        secrets.accessTokenExpiry > Date.now()) return logger.log('Token still valid, not refreshing', 'debug'); // Previous token is still valid

    if (secrets.refreshToken && secrets.clientId && secrets.clientSecret) {
        // Refresh token exists
        logger.log('Refreshing token', 'info');
        await getToken('refresh_token', {
            refreshToken: secrets.refreshToken,
            clientId: secrets.clientId,
            clientSecret: secrets.clientSecret
        }).then(token => {
            secrets.tokenType = token.token_type;
            secrets.accessToken = token.access_token;
            secrets.accessTokenExpiry = Date.now() + (token.expires_in * 1000);
            secrets.refreshToken = token.refresh_token || secrets.refreshToken;
            secrets.scope = token.scope;
            secrets.countryCode = token.user?.countryCode;
            secrets.userId = token.user_id;
        }).catch(err => {
            logger.log(`Failed to refresh token: ${err?.error_description || 'No error description'} [${err?.sub_status || 'No error code'}]`, 'error');
        });
    }

    if (!secrets.accessToken || secrets.accessTokenExpiry <= Date.now()) {
        logger.log('Attempting to authorize with device authorization', 'debug');
        await authorizeWithDeviceAuthorization({
            clientId: config.clientId,
            clientSecret: config.clientSecret,
            scope: config.scope
        }).then((token: any) => {
            secrets.tokenType = token.token_type;
            secrets.accessToken = token.access_token;
            secrets.accessTokenExpiry = Date.now() + (token.expires_in * 1000);
            secrets.refreshToken = token.refresh_token;
            secrets.clientId = config.clientId;
            secrets.clientSecret = config.clientSecret;
            secrets.scope = token.scope;
            secrets.countryCode = token.user?.countryCode;
            secrets.userId = token.user_id;
        }).catch(err => {
            throw new Error(`Failed to get access token: ${err?.error_description || 'No error description'} [${err?.sub_status || 'No error code'}]`);
        });
    }

    if (secretsPath) fs.writeFileSync(secretsPath, JSON.stringify(secrets, null, 4));
}

async function authorizeWithDeviceAuthorization(params: {
    clientId: string;
    clientSecret: string;
    scope: string[];
}) {
    const deviceAuthorization = await requestDeviceAuthorization(params.clientId, params.scope);
    logger.log(`Please visit ${Logger.applyColor({ bold: true }, `https://${deviceAuthorization.verificationUriComplete || `${deviceAuthorization.verificationUri || 'link.tidal.com'}/${deviceAuthorization.userCode}`}`)} to log in to your TIDAL account.\nWaiting for authorization...`, 'info');

    const deviceAuthorizationStart = Date.now();
    const token = await new Promise((resolve, reject) => {
        (function waitForToken() {
            setTimeout(() => {
                getToken('urn:ietf:params:oauth:grant-type:device_code', {
                    clientId: params.clientId,
                    clientSecret: params.clientSecret,
                    deviceCode: deviceAuthorization.deviceCode,
                    scope: params.scope
                }).then(token => {
                    resolve(token);
                }).catch(err => {
                    if (Date.now() - deviceAuthorizationStart >= deviceAuthorization.expiresIn * 1000) {
                        // Code expired
                        logger.log('Code expired!', 'warn');
                        return authorizeWithDeviceAuthorization(params);
                    }
                    if (err.sub_status !== 1002) {
                        // Error other than authorization pending
                        return reject(err);
                    }
                    // Still waiting for authorization
                    return waitForToken();
                });
            }, (deviceAuthorization.interval || 2) * 1000);
        })();
    });

    return token;
};

function showHelp() {
    // hell hell hell hell hell
    logger.log(`
Usage:
  ${process.argv0}${path.dirname(process.execPath) === process.cwd() ? '' : ' .'} [options...]
Options:
  ${argOptions.filter(arg => !arg.hidden).map(arg => `${
    `${[
        arg.name ? `--${arg.name}` : null,
        arg.shortName ? `-${arg.shortName}` : null,
        ...(arg.aliases ? arg.aliases.map(alias => [`--${alias}`]) : []),
        ...(arg.shortAliases ? arg.shortAliases.map(alias => [`-${alias}`]) : []),
    ]
    .filter(i => i)
    .join(', ')}\
${arg.valueDescription ? ` <${arg.valueDescription}>` : ''}`.padEnd(60 - 1, ' ')} \
${arg.description || 'No description...'}\
${(arg.default !== undefined && arg.default !== null) ? ` - Default: ${
    arg.default === true ? 'yes' :
    arg.default === false ? 'no' :
    arg.default
}` : ''}`).join('\n  ')}
`.trim());

    process.exit(0);
}