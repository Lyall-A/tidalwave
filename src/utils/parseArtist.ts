import stripMarkup from './stripMarkup';

import { config, tidalArtistPictureSizes } from '../globals';
import { Artist } from '../types';

import parseAlbum from './parseAlbum';

export default function parseArtist(artist: any, additional: any = { }): Artist {
    return {
        id: artist.id,
        name: artist.name,
        biography: additional?.biography?.text ? {
            originalText: additional.biography.text,
            text: stripMarkup(additional.biography.text),
            source: additional.biography.source
        } : null,
        pictures: artist.picture && Object.fromEntries(Object.entries(tidalArtistPictureSizes).map(([name, size]) => [name, `${config.resourcesBaseUrl}/images/${artist.picture.replace(/-/g, '/')}/${size}.jpg`])) || null,
        types: artist.artistTypes,
        roles: artist.artistRoles?.map((role: any) => ({
            id: role.categoryId,
            name: role.category
        })),
        albums: additional?.albums?.map((album: any) => parseAlbum(album))
    };
}