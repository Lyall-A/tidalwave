const fs = require('fs');
const path = require('path');

const parseConfig = require('./utils/parseConfig');
const Logger = require('./utils/Logger');

// bun moment
const execDir = path.dirname(__filename);
const execFile = __filename;

// Read config
const configPath = path.resolve(execDir, 'config.json');
if (!fs.existsSync(configPath)) fs.writeFileSync(configPath, JSON.stringify(require('./default.config.json'), null, 4));
const config = parseConfig(configPath);

// Read secrets
const secretsPath = config.secretsPath ? path.resolve(execDir, config.secretsPath) : undefined;
const secrets = fs.existsSync(secretsPath) ? JSON.parse(fs.readFileSync(secretsPath)) : { };

const logger = new Logger({
    debugLogs: config.debug
});

module.exports = {
    config,
    secrets,
    configPath,
    secretsPath,
    execDir,
    execFile,
    logger,
    argOptions: [
        { name: 'help', shortName: 'h', noValue: true, description: 'Displays this menu' },

        { name: 'track', shortName: 't', type: 'int', description: 'Download a track ID', valueDescription: 'track-id' },
        { name: 'album', shortName: 'm', type: 'int', description: 'Download a album ID', valueDescription: 'album-id' },
        { name: 'video', shortName: 'v', description: 'Download a video ID', valueDescription: 'video-id' },
        { name: 'artist', shortName: 'a', type: 'int', description: 'Download an artist ID\'s discography', valueDescription: 'artist-id' },
        { name: 'playlist', shortName: 'p', description: 'Download all items from a playlist UUID', valueDescription: 'playlist-uuid' },
        { name: 'search', shortName: 's', description: 'Download top search', valueDescription: 'query' },
        { name: 'search:track', shortName: 's:t', description: 'Download top search for a track', valueDescription: 'query' },
        { name: 'search:album', shortName: 's:m', description: 'Download top search for a album', valueDescription: 'query' },
        { name: 'search:video', shortName: 's:v', description: 'Download top search for a video', valueDescription: 'query' },
        { name: 'search:artist', shortName: 's:a', description: 'Download top search for a artist', valueDescription: 'query' },
        { name: 'search:playlist', shortName: 's:p', description: 'Download top search for a playlist', valueDescription: 'query' },
        { name: 'url', shortName: 'u', description: 'Download from a TIDAL URL', valueDescription: 'url' },
        { name: 'update', description: 'Update an existing file with metadata from TIDAL', valueDescription: 'path' },

        { name: 'track-quality', shortName: 'tq', aliases: ['quality'], shortAliases: ['q'], description: 'Track download quality', valueDescription: 'low|high|max', default: config.trackQuality },
        { name: 'video-quality', shortName: 'vq', description: 'Video download quality', valueDescription: 'low|high|max|<height>', default: config.videoQuality },
        { name: 'dolby-atmos', shortName: 'da', type: 'bool', description: 'Downloads in immersive audio when available. Requires a token from a mobile device', valueDescription: 'yes|no', default: config.useDolbyAtmos },
        { name: 'metadata', shortName: 'md', type: 'bool', description: 'Embed metadata to download', valueDescription: 'yes|no', default: config.embedMetadata },
        { name: 'lyrics', shortName: 'l', type: 'bool', description: 'Download lyrics if available', valueDescription: 'yes|no', default: config.getLyrics },
        { name: 'cover', shortName: 'c', type: 'bool', description: 'Download cover art', valueDescription: 'yes|no', default: config.getCover },
        { name: 'overwrite', shortName: 'ow', type: 'bool', description: 'Overwrite existing downloads', valueDescription: 'yes|no', default: config.overwriteExisting }
    ],
    tidalTrackQualities: {
        'LOW': 'HIGH',
        'HIGH': 'LOSSLESS',
        'MAX': 'HI_RES_LOSSLESS'
    },
    tidalVideoQualities: {
        'LOW': '480',
        'MEDIUM': '720',
        'HIGH': '1080',
        'MAX': null
    },
    tidalVideoCoverSizes: {
        '640': '640x640',
        '1280': '1280x1280',
        '1280x720': '1280x720',
        '640x360': '640x360',
        'ORIGINAL': 'origin'
    },
    tidalAlbumCoverSizes: {
        '640': '640x640',
        '1280': '1280x1280',
        'ORIGINAL': 'origin'
    },
    tidalArtistPictureSizes: {
        'ORIGINAL': 'origin'
    },
    tidalPlaylistImageSizes: {
        'ORIGINAL': 'origin'
    },
    tidalCredits: [
        // NOTE: found from searching various albums and tracks, theres definitely more

        // Found in both track and album credits
        { type: 'Producer' },
        { type: 'Assistant Engineer' },
        { type: 'Engineer' },

        // Track credits
        { type: 'Executive Producer' },
        { type: 'Composer' },
        { type: 'Mastering Engineer' },
        { type: 'Mixing Engineer' },
        { type: 'Additional Engineer' },
        { type: 'Recording Engineer' },
        { type: 'Associated Performer' },
        { type: 'Assistant Producer' },
        { type: 'Assistant Recording Engineer' },
        { type: 'Assistant Mixing Engineer' },
        { type: 'Featured Artist' },
        { type: 'Remixer', },
        { type: 'Drum Kit' },
        { type: 'Synthesizer' },
        { type: 'Mixer' },
        { type: 'Lyricist' },
        { type: 'Background Vocal' },
        { type: 'Talkbox' },
        { type: 'Vocoder' },
        { type: 'Vocal' },
        { type: 'Guitar' },
        { type: 'Bass' },
        { type: 'Piano' },
        { type: 'Drums' },
        { type: 'Drum' },
        { type: 'Horn' },
        { type: 'Strings' },
        { type: 'Whistles' },
        { type: 'Keyboards' },

        // Album credits
        { type: 'Primary Artist' },
        { type: 'Arranger' },
        { type: 'Mixing' },
        { type: 'Mixing Assistant' },
        { type: 'Mastering' },
        { type: 'Music Publisher', tagName: 'publisher' },
        { type: 'Record Label', tagName: 'label' },
        { type: 'Layout', tagName: null },
        { type: 'Artwork', tagName: null },
        { type: 'Package Design', tagName: null },
        { type: 'Art Direction', tagName: null },
        { type: 'Design', tagName: null },
        { type: 'Vocals', tagName: null },
        { type: 'Graphic Design', tagName: null },
        
        // Unknown
        { type: 'Additional Mixing Engineer' },
        { type: 'Keyboard' },
        { type: 'Banjo' },
        { type: 'Vocalist' },
        { type: 'Vocal Producer' },
        { type: 'Vocal Arranger' },
        { type: 'Programmer' },
        { type: 'Mastering Second Engineer' },
        { type: 'Production Coordinator' },
        { type: 'Sequencer' },
        { type: 'Conductor' },
        { type: 'Programming' },
        { type: 'Saxophone' },
        { type: 'Recording' },
        { type: 'Second Engineer' },
        { type: 'Co-Producer' },
        { type: 'Violin' },
        { type: 'Cello' },
        { type: 'Percussion' },
        { type: 'Coordination' },
        { type: 'Background Vocalist' },
        { type: 'A&R' },
        { type: 'Creative Director' },
        { type: 'Drum Programming' },
        { type: 'Studio Personnel' },
        { type: 'Management' },
        { type: 'Additional Producer' },
        { type: 'Writer' },
        { type: 'SoundEffects', tagName: 'sound_effects' },
        { type: 'DrumProgrammer', tagName: 'drum_programmer' },
        { type: 'MusicProduction', tagName: 'music_production' },
        { type: 'BassVocalist', tagName: 'bass_vocalist' },
        { type: 'AdditionalProducer', tagName: 'additional_producer' },
        { type: 'AdditionalVocalist', tagName: 'additional_vocalist' },
        { type: 'RecordingArranger', tagName: 'recording_arranger' },
        { type: 'ChoirArranger', tagName: 'choir_arranger' },
        { type: 'Photography', tagName: null },
        { type: 'Original Paintings', tagName: null },
        { type: 'Marketing', tagName: null },
    ].map(credit => {
        // Fill blank tagName
        if (credit.tagName === undefined) credit.tagName = credit.type.toLowerCase().replace(/\s/g, '_');
        return credit;
    })
}