const tidalApi = require('./tidalApi');
const parseAlbum = require('./parseAlbum');

async function getAlbum(albumId) {
    return parseAlbum(
        await tidalApi('privatev1', `/albums/${albumId}`).then(({ json }) => json),
        await tidalApi('privatev1', '/pages/album', { query: { albumId } }).then(async ({ json }) => {
            const { album, description, credits, review } = json.rows[0].modules[0];
            const tracks = json.rows[1].modules[0].pagedList.items.filter(({ type }) => type === 'track').map(({ item }) => item); // Default limit seems to be 9999
            const trackCredits = await tidalApi('privatev1', `/albums/${albumId}/items/credits?replace=true&includeContributors=true&offset=0&limit=100`).then(({ json }) => json.items.filter(item => item.type === 'track'));
            return {
                ...album,
                description,
                credits,
                trackCredits,
                review,
                tracks,
            };
        })
    );
}

module.exports = getAlbum;