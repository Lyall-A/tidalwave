const parseTrack = require("./parseTrack");

function parseMix(mix, additional = { }) {
    return {
        id: mix.id,
        title: mix.title,
        subTitle: mix.subTitle,
        shortSubTitle: mix.shortSubtitle,
        description: mix.description,
        images: Object.fromEntries(Object.entries(mix.images).map(([key, value]) => [key, value.url])),
        detailImages: Object.fromEntries(Object.entries(mix.detailImages).map(([key, value]) => [key, value.url])),
        tracks: additional?.items.map(item => parseTrack(item))
    };
}

module.exports = parseMix;