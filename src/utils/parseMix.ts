import parseTrack from './parseTrack';

export default function parseMix(mix: any, additional: any = { }) {
    return {
        id: mix.id,
        title: mix.title,
        subTitle: mix.subTitle,
        shortSubTitle: mix.shortSubtitle,
        description: mix.description,
        images: Object.fromEntries(Object.entries(mix.images).map(([key, value]: any) => [key, value.url])),
        detailImages: Object.fromEntries(Object.entries(mix.detailImages).map(([key, value]: any) => [key, value.url])),
        tracks: additional?.items.map((item: any) => parseTrack(item))
    };
}