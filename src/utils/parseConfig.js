const fs = require('fs');

const defaultConfig = require('../default.config.json');

function parseConfig(configPath) {
    const jsonConfig = JSON.parse(fs.readFileSync(configPath));
    let version = jsonConfig._version;

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
            delete config.createPlaylistFile
        }

        version = 5;
    }

    config._version = version;

    if (version !== jsonConfig._version) fs.writeFileSync(configPath, JSON.stringify(config, null, 4));

    return config;
}

module.exports = parseConfig;