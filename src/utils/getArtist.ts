import tidalApi from './tidalApi';

import parseArtist from './parseArtist';

export default async function getArtist(artistId: number) {
    return tidalApi('privatev2', `/artist/${artistId}`).then(({ json }) => parseArtist(json.item.data, {
        biography: json.header.biography,
        albums: json.items.filter((item: any) => item.moduleId === 'ARTIST_ALBUMS' || item.moduleId === 'ARTIST_TOP_SINGLES').map(({ items }: any) => items.map(({ data }: any) => data)).flat()
    }));
}