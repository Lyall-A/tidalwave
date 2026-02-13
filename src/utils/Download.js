const fs = require('fs');
const path = require('path');
const { setTimeout } = require('timers/promises');

const Logger = require('./Logger');
const getPlaybackInfo = require('./getPlaybackInfo');
const parseManifest = require('./parseManifest');
const createMedia = require('./createMedia');
const embedMetadata = require('./embedMetadata');
const extractContainer = require('./extractContainer');
const getLyrics = require('./getLyrics');
const formatString = require('./formatString');
const normalizeTag = require('./normalizeTag');
const capitalize = require('./capitalize');

class Download {
    constructor(options = { }) {
        this.details = options.details;
        this.logger = options.logger;
        this.directory = options.directory;
        this.mediaFilename = options.mediaFilename;
        this.coverFilename = options.coverFilename ?? 'cover';
        this.playlistCoverFilename = options.playlistCoverFilename;
        this.playlistFileFilename = options.playlistFileFilename;
        this.trackQuality = options.trackQuality;
        this.videoQuality = options.videoQuality;
        this.overwriteExisting = options.overwriteExisting ?? false;
        this.embedMetadata = options.embedMetadata ?? true;
        this.metadataEmbedder = options.metadataEmbedder ?? 'ffmpeg';
        this.keepCoverFile = options.keepCoverFile ?? true;
        this.getCover = options.getCover ?? true;
        this.getLyrics = options.getLyrics ?? true;
        this.syncedLyricsOnly = options.syncedLyricsOnly ?? false;
        this.plainLyricsOnly = options.plainLyricsOnly ?? false;
        this.externalLyrics = options.externalLyrics ?? false;
        this.useArtistsTag = options.useArtistsTag ?? true;
        this.artistTagSeparator = options.artistTagSeparator;
        this.roleTagSeparator = options.roleTagSeparator;
        this.customMetadata = options.customMetadata;
        this.keepOriginalFile = options.keepOriginalFile ?? false;
        this.segmentWaitMin = options.segmentWaitMin ?? 0;
        this.segmentWaitMax = options.segmentWaitMax ?? 0;
        this.downloadLogPadding = options.downloadLogPadding ?? 0;
        this.logPrefix = options.logPrefix;
        this.useDolbyAtmos = options.useDolbyAtmos ?? false;

        this.playbackInfo = options.playbackInfo;
        this.manifest = options.manifest;
        this.segmentUrls = options.segmentUrls;
        this.originalExtension = options.originalExtension;
        this.mediaExtension = options.mediaExtension;
        this.coverExtension = options.coverExtension ?? '.jpg';
        this.lyrics = options.lyrics;
        this.metadata = options.metadata;
    }
    
    async download() {
        const startDate = Date.now();
        this.logger.lastLog = '';

        fs.mkdirSync(this.directory, { recursive: true }); // Create directory
        await this.getSegments(); // Get segment URL's
        if (fs.existsSync(this.getMediaPath()) && !this.overwriteExisting) return this.log('Already downloaded!'); // Check if already downloaded
        if (this.details.playlist || this.details.mix) await this.createPlaylist(); // Create playlist info (.m3u8 and cover)
        await this.downloadSegments(); // Download segments
        if (this.embedMetadata) await this.getMetadata(); // Get metadata
        await this.createMedia(); // Create output
        if (!this.keepOriginalFile) fs.unlinkSync(this.getOriginalPath()); // Delete container file
        if (!this.keepCoverFile && fs.existsSync(this.getCoverPath())) fs.unlinkSync(this.getCoverPath()); // Delete cover file

        this.log(`Completed (${Math.floor((Date.now() - startDate) / 1000)}s)`);
    }

    async createPlaylist() {
        // Download playlist cover
        // TODO: make cleaner
        if (this.getCover && this.playlistCoverFilename && !fs.existsSync(this.getPlaylistCoverPath())) {
            this.log(`Downloading ${this.details.isMix ? 'mix' : 'playlist'} cover...`);
            await fetch(this.details.isMix ? this.details.mixCover : this.details.playlistCover).then(async res => {
                if (res.status !== 200) throw new Error(`Got status code ${res.status}`);
                const coverBuffer = Buffer.from(await res.arrayBuffer());
                fs.writeFileSync(this.getPlaylistCoverPath(), coverBuffer);
            }).catch(err => {
                this.log(`Failed to download ${this.details.isMix ? 'mix' : 'playlist'} cover: ${err.message}`, 'error');
            });
        } else {
            this.log(`${this.details.isMix ? 'Mix' : 'Playlist'} cover already downladed`);
        }

        // Create playlist .m3u8 file
        if (this.playlistFileFilename && !fs.existsSync(this.getPlaylistFilePath())) {
            fs.writeFileSync(this.getPlaylistFilePath(), '#EXTM3U\r\n');
        }
    }

    async getSegments() {
        this.log('Getting segment URL\'s...');
        this.playbackInfo = await getPlaybackInfo(this.details.id, this.details.type, this.details.isVideo ? 'HIGH' : this.trackQuality, (this.details.isTrack && this.details.track.qualityTypes.includes('DOLBY_ATMOS') && this.useDolbyAtmos) ? true : false);
        this.manifest = await parseManifest(Buffer.from(this.playbackInfo.manifest, 'base64').toString(), this.playbackInfo.manifestMimeType);

        if (this.playbackInfo.assetPresentation === 'PREVIEW') this.log('Downloading preview, make sure you have a valid subscription!', 'warn');
        
        if (this.details.isTrack) {
            this.segmentUrls = this.manifest.segments;
            this.originalExtension = '.mp4';
            this.mediaExtension =
                this.manifest.codec === 'flac' ? '.flac' : // Used for lossless and hi-res lossless
                this.manifest.codec === 'ac4' ? '.mp4' : // Used for dolby atmos
                '.m4a'; // used for low quality // TODO: is it safe to assume AAC?
        } else if (this.details.isVideo) {
            const segmentManifests = this.manifest.mainManifests[0].segmentManifests;

            const segmentManifest = this.videoQuality ?
                segmentManifests.reduce((closest, curr) => {
                    const height = parseInt(curr.resolution.split('x')[1], 10);
                    const closestHeight = parseInt(closest.resolution.split('x')[1], 10);
                    const targetHeight = parseInt(this.videoQuality, 10);
                    return Math.abs(height - targetHeight) < Math.abs(closestHeight - targetHeight) ? curr : closest;
                }) :
                segmentManifests.reduce((highest, curr) => {
                    const height = parseInt(curr.resolution.split('x')[1], 10);
                    const highestHeight = parseInt(highest.resolution.split('x')[1], 10);
                    return height > highestHeight ? curr : highest;
                });

            // this.segmentUrls = segmentManifests[segmentManifests.length - 1].segments;
            this.segmentUrls = segmentManifest.segments;
            
            this.originalExtension = '.ts';
            this.mediaExtension = '.mp4';
        }

        return this.segmentUrls;
    }

    async getMetadata() {
        // Get lyrics
        if (this.getLyrics && this.details.isTrack) {
            this.log('Getting lyrics...');
            this.lyrics = await getLyrics(this.details.id).then(lyrics =>
                this.syncedLyricsOnly ? lyrics?.syncedLyrics : // Synced lyrics only
                this.plainLyricsOnly ? lyrics?.plainLyrics : // Plain lyrics only
                lyrics?.syncedLyrics || lyrics?.plainLyrics // Whatever is available
            ).catch(err => { });
            if (this.externalLyrics && this.lyrics) fs.writeFileSync(this.getLyricsPath(), this.lyrics); // Save lyrics externally
        }

        // Download cover
        if (this.getCover && this.coverFilename && !fs.existsSync(this.getCoverPath())) {
            this.log('Downloading cover...');
            await fetch(this.details.cover).then(async res => {
                if (res.status !== 200) throw new Error(`Got status code ${res.status}`);
                const coverBuffer = Buffer.from(await res.arrayBuffer());
                fs.writeFileSync(this.getCoverPath(), coverBuffer);
            }).catch(err => {
                this.log(`Failed to download cover: ${err.message}`, 'error');
            });
        } else {
            this.log('Cover already downladed');
        }

        // Add to M3U playlist
        if (this.playlistFileFilename && fs.existsSync(this.getPlaylistFilePath())) {
            // #EXTINF:<duration>,<artist names seperated with ", "> - <full title>
            // fs.appendFileSync(this.getPlaylistFilePath(), `#EXTINF:${this.details.duration},${this.details.artists.map(artist => artist.name).join(', ')} - ${this.details.title}\r\n${path.basename(this.getMediaPath())}\r\n`);
            // #EXTINF:<duration>,<main artist> - <full title>
            fs.appendFileSync(this.getPlaylistFilePath(), `#EXTINF:${this.details.duration},${this.details.artist.name} - ${this.details.title}\r\n${path.basename(this.getMediaPath())}\r\n`);
        }

        // Metadata
        const album = this.details.album;
        const track = this.details.track;

        const albumCredits = this.details.album?.credits || [];
        const trackCredits = this.details.album?.trackCredits.find(({ track }) => track.id === this.details.id)?.credits || [];

        const customMetadata = this.customMetadata?.map(i => ([i[0], formatString(i[1], this.details)])) || [];
        const creditMetadata = [...trackCredits, ...albumCredits].map(credit => credit.tagName ? [credit.tagName, normalizeTag(credit.contributors.map(i => i.name), this.roleTagSeparator)] : null).filter(i => i);

        this.metadata = [
            ['title', this.details.title],
            ['artist', normalizeTag(this.details.artists?.map(i => i.name), !this.useArtistsTag ? this.artistTagSeparator : null)],
            ['artists', this.useArtistsTag ? normalizeTag(this.details.artists?.map(i => i.name), this.artistTagSeparator) : null],
            ['version', track?.version],
            ['album', album?.title],
            ['albumartist', normalizeTag(this.details.albumArtists?.map(i => i.name), !this.useArtistsTag ? this.artistTagSeparator : null)],
            ['albumartists', this.useArtistsTag ? normalizeTag(this.details.albumArtists?.map(i => i.name), this.artistTagSeparator) : null],
            ['albumversion', album?.version],
            ['releasetype', album?.type && album.type.length > 2 ? capitalize(album.type) : album?.type],
            ['date', this.details.releaseDate],
            ['originalyear', this.details.releaseYear],
            ['tracktotal', album?.trackCount],
            ['tracknumber', track?.trackNumber],
            ['disctotal', album?.volumeCount],
            ['discnumber', track?.volumeNumber],
            ['replaygain_album_gain', this.playbackInfo?.albumReplayGain],
            ['replaygain_album_peak', this.playbackInfo?.albumPeakAmplitude],
            ['replaygain_track_gain', this.playbackInfo?.trackReplayGain || track?.replayGain], // NOTE: details.track.replayGain is actually playbackInfo.albumReplayGain
            ['replaygain_track_peak', this.playbackInfo?.trackPeakAmplitude || track?.peak],
            ['copyright', track?.copyright],
            ['barcode', album?.upc],
            ['isrc', track?.isrc],
            ['itunesadvisory', this.details.explicit === true ? '1' : this.details.explicit === false ? '2' : null],
            ['bpm', track?.bpm],
            ['initialkey', [track?.key?.toUpperCase(), track?.keyScale ? capitalize(track.keyScale) : null].filter(i => i).join(' ') || null],
            ['lyrics', this.lyrics],
            ...creditMetadata,
            ...customMetadata
        ].filter(([tag, value]) => value !== undefined && value !== null);
        
        // most overkill debug log ever
        this.logger.debug(`Metadata:\n${this.metadata.map(([tag, value]) => {
            const padding = ' '.repeat(Logger.getDisplayedLength(this.logger.getLevel('debug')?.prefix || ''));
            const valuePrefix = `${tag}: `.padEnd(25, ' ');
            return `${padding}${valuePrefix}${value.toString().replace(/\n/g, `\n${padding}${' '.repeat(Logger.getDisplayedLength(valuePrefix))}`)}`;
        }).join('\n')}`);
    }
        
    async downloadSegments() {
        const stream = fs.createWriteStream(this.getOriginalPath());

        for (let segmentIndex = 0; segmentIndex < this.segmentUrls.length; segmentIndex++) {
            const segmentUrl = this.segmentUrls[segmentIndex]
                .replace(/&amp;/g, '&'); // fix error when tidal uses key-pair-id parameter instead of token
                
            this.log(`Downloading segment ${segmentIndex + 1} of ${this.segmentUrls.length}...`);
            
            const segmentData = await fetch(segmentUrl).then(async res => Buffer.from(await res.arrayBuffer()));
            stream.write(segmentData);

            const delay = Math.floor(Math.random() * (this.segmentWaitMax - this.segmentWaitMin + 1) + this.segmentWaitMin);
            if (delay) await setTimeout(delay)
        }

        stream.end();
    }

    async createMedia() {
        if (this.manifest?.codec === 'ac4') {
            this.log('Dolby AC-4 is not currently supported, keeping original stream!', 'warn');
            return fs.copyFileSync(this.getOriginalPath(), this.getMediaPath());
        }

        if (!this.embedMetadata || this.metadataEmbedder !== 'ffmpeg') {
            // Extract from container
            this.log(`Converting to ${this.mediaExtension}...`);
            await extractContainer(this.getOriginalPath(), this.getMediaPath());
        }
        
        if (this.embedMetadata) {
            // Embed metadata
            if (this.metadataEmbedder === 'kid3') {
                // Embed via kid3
                this.log('Embedding metadata...');
                await embedMetadata(this.getMediaPath(), [...this.metadata, ['picture', fs.existsSync(this.getCoverPath()) ? this.getCoverPath() : undefined, true]]).catch(err => {
                    this.log(`Failed to embed metadata: ${err.message}`, 'error');
                });
            } else {
                // Extract and embed via FFmpeg
                this.log(`Converting to ${this.mediaExtension} with metadata...`);
                await createMedia(this.getOriginalPath(), this.getMediaPath(), this.metadata, fs.existsSync(this.getCoverPath()) ? this.getCoverPath() : undefined, this.details.isVideo ? 2 : 1);
            }
        }
    }

    getMediaPath() {
        return path.join(this.directory, `${this.mediaFilename}${this.mediaExtension}`);
    }

    getOriginalPath() {
        return path.join(this.directory, `${this.mediaFilename}.original${this.originalExtension}`);
    }

    getCoverPath() {
        return path.join(this.directory, `${this.coverFilename}${this.coverExtension}`);
    }

    getLyricsPath() {
        return path.join(this.directory, `${this.mediaFilename}.lrc`);
    }

    getPlaylistFilePath() {
        return path.join(this.directory, `${this.playlistFileFilename}.m3u8`);
    }

    getPlaylistCoverPath() {
        return path.join(this.directory, `${this.playlistCoverFilename}${this.coverExtension}`);
    }

    log(msg, level) {
        const levelPrefix = this.logger.getLevel(level)?.prefix;
        const logPrefix = this.logPrefix || `Downloading ${Logger.applyColor({ bold: true }, this.details.title)} - ${Logger.applyColor({ bold: true }, this.details.artist.name)}: `;
        const padding = ' '.repeat(Math.max(this.downloadLogPadding - Logger.getDisplayedLength(`${levelPrefix || ''}${logPrefix}`), 0));
        const log = `${logPrefix}${padding}${msg}`;
        if (level) {
            this.logger.log(level, log, true, true);
        } else {
            this.logger.info(log, true);
        }
    }
}

module.exports = Download;