const parseTrack = require("./parseTrack");

function parseMix(mix, additional = { }) {
    return {
        id: mix.id,
        title: mix.title,
        subTitle: mix.subTitle,
        shortSubTitle: mix.shortSubtitle,
        description: mix.description,
        // images: mix.images, // TODO: add images (no text) and detailImages (with text)
        tracks: additional?.items.map(item => parseTrack(item))
    };
}

module.exports = parseMix;