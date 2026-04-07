import tidalApi from './tidalApi';

import parsePlaylist from './parsePlaylist';

export default async function getPlaylist(playlistUuid: string) {
    const playlist = await tidalApi('privatev2', `/user-playlists/${playlistUuid}`).then((res: any) => res.json);

    const items: any = [];
    await (async function getItems(offset = 0, limit = 50): Promise<void> {
        return tidalApi('privatev1', `/playlists/${playlistUuid}/items`, {
            query: {
                offset,
                limit
            }
        }).then(({ json }: any) => {
            items.push(...json.items);
            const nextOffset = json.offset + json.limit;
            if (nextOffset < json.totalNumberOfItems) return getItems(nextOffset);
        });
    })();

    return parsePlaylist(playlist.playlist, {
        items
    });
}