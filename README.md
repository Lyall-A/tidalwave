# Tidalwave
A CLI-based TIDAL downloader capable of downloading just about anything

## Features
* **Lossless Audio** - Can download in the highest possible quality
* **Videos** - Can download videos from TIDAL (music videos, etc.)
* **Playlists** - Can download all items from a playlist
* **Artist Discography** - Can download an entire artist's discography
* **Advanced Metadata** - Includes as much metadata as possible, including title, album, artist, date, BPM, copyright, barcode, replaygain, explicit rating, credits and more
* **Dolby Atmos** - Can download using Dolby Atmos immersive audio
* **Lyrics** - Includes synced/plain lyrics if possible
* **Cover Art** - Downloads the album cover art
* **Searching** - Allows searching instead of having to provide URL's or ID's

## Usage (TODO)
Run `./tidalwave --help` in your terminal for a list of available commands

## Screenshots
<img src="https://raw.githubusercontent.com/Lyall-A/tidalwave/main/assets/screenshot-1.png">

## Configuration (TODO)
`useArtistsTag` can be set to `true` or `false` to enable/disable `artists` and `albumartists` tag

`trackCoverSize` can be set to `original` for very high quality cover art, however this breaks FFmpeg embedding if it's over 16MB

`metadataEmbedder` can be set to `ffmpeg` or `kid3` to change how metadata is embedded, `kid3` must be downloaded for it to work

`allowUserUploads` can be set to allow/block user uploaded tracks

`artistTagSeparator` the separator used for multiple artists in metadata

`roleTagSeparator` the separator used for multiple roles in metadata (composer, lyricist, etc.)

`coverFilename` can be set to null to delete jpg after embedding

`segmentWaitMin` and `segmentWaitMax` adds a delay between downloading segments, can maybe reduce ban or rate limit risk (if there is one)

Check out `config.json` for more

## Dependencies
* JavaScript runtime, such as [Node.js](https://nodejs.org/) or [Bun](https://bun.com/)
* [FFmpeg](https://www.ffmpeg.org/)
* [Kid3-cli](https://kid3.kde.org) (Optional)

## ⚠️ Warning ⚠️
There may be a risk of getting banned for using a tool like this