import fs from 'fs';

import defaultConfig from '../default.config.json';

export type TypeOptions = {
    directory: string;
    filename: string;
    coverFilename: string | null;
}

export type Config = {
    _version: number;
    defaultTypeOptions: TypeOptions;
    typeOptions: {
        album?: TypeOptions;
        video?: TypeOptions;
        playlist?: TypeOptions;
        mix?: TypeOptions;
    };
    trackQuality: string;
    videoQuality: string;
    playlistCoverFilename: string;
    playlistFileFilename: string;
    mixCoverFilename: string;
    mixFileFilename: string;
    useDolbyAtmos: boolean;
    getLyrics: boolean;
    syncedLyricsOnly: boolean;
    plainLyricsOnly: boolean;
    externalLyrics: boolean;
    embedMetadata: boolean;
    artistTagSeparator: string;
    roleTagSeparator: string;
    useArtistsTag: boolean;
    allowUserUploads: boolean;
    forcePartialData: boolean;
    partialDataFallback: boolean;
    getCover: boolean;
    trackCoverSize: string;
    videoCoverSize: string;
    playlistCoverSize: string;
    mixCoverSize: string;
    customMetadata: [string, string][];
    metadataEmbedder: string;
    downloadLogPadding: number;
    overwriteExisting: boolean;
    segmentWaitMin: number;
    segmentWaitMax: number;

    ffmpegPath: string;
    kid3CliPath: string;
    secretsPath: string;

    debug: boolean;
    clientId: string;
    clientSecret: string;
    scope: string[];
    openApiV2BaseUrl: string;
    authApiBaseUrl: string;
    privateApiV1BaseUrl: string;
    privateApiV2BaseUrl: string;
    resourcesBaseUrl: string;
};

export default function parseConfig(configPath: string): Config {
    const jsonConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    let version = jsonConfig._version;
    let shouldUpdate = false;

    const config = {
        ...defaultConfig,
        ...jsonConfig
    };

    // TODO: create replace function
    if (!version) {
        if (config.coverSize !== undefined) {
            config.trackCoverSize = config.coverSize;
            delete config.coverSize;
        }

        if (config.downloadDirectory !== undefined) {
            config.albumDirectory = config.downloadDirectory;
            delete config.downloadDirectory;
        }

        if (config.downloadFilename !== undefined) {
            config.trackFilename = config.downloadFilename;
            delete config.downloadFilename;
        }

        if (config.quality !== undefined) {
            config.trackQuality = config.quality;
            delete config.quality;
        }
        
        version = 1;
    }

    if (version === 1) {
        if (config.artistSeperator !== undefined) {
            config.tagSeperator = config.artistSeperator;
            delete config.artistSeperator;
        }

        version = 2;
    }

    if (version === 2) {
        if (config.tagSeperator !== undefined) {
            config.artistTagSeparator = config.tagSeperator;
            delete config.tagSeperator;
        }

        version = 3;
    }

    if (version === 3) {
        if (config.albumDirectory !== undefined) {
            config.defaultTypeOptions.directory = config.albumDirectory;
            delete config.albumDirectory;
        }
        if (config.trackFilename !== undefined) {
            config.defaultTypeOptions.filename = config.trackFilename;
            delete config.trackFilename;
        }
        if (config.videoDirectory !== undefined) {
            config.typeOptions.video.directory = config.videoDirectory;
            delete config.videoDirectory;
        }
        if (config.videoFilename !== undefined) {
            config.typeOptions.video.filename = config.videoFilename;
            delete config.videoFilename;
        }
        if (config.coverFilename !== undefined) {
            config.defaultTypeOptions.coverFilename = config.coverFilename;
            delete config.coverFilename;
        }

        version = 4;
    }

    if (version === 4) {
        if (config.createPlaylistFile !== undefined) {
            if (!config.createPlaylistFile) config.playlistFileFilename = null;
            delete config.createPlaylistFile;
        }

        version = 5;
    }

    if (version === 5) {
        // Old Client ID and Client Secret stopped working
        if (config.clientId === '1ozX4gKj6qmZu4rg') {
            config.clientId = defaultConfig.clientId;
            shouldUpdate = true;
        }
        if (config.clientSecret === 'nc0ZouR3w3YSLN1dyvhTUXZE9dRwDdiV1ivFNFhImkE=') {
            config.clientSecret = defaultConfig.clientSecret;
            shouldUpdate = true;
        }
    }

    config._version = version;

    if (version !== jsonConfig._version) shouldUpdate = true;
    if (shouldUpdate) fs.writeFileSync(configPath, JSON.stringify(config, null, 4));

    return config;
}